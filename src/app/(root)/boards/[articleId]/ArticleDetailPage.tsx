'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CommentInput from '@/components/input/CommentInput';
import CommentCard from '@/components/comment/CommentCard';
import FloatingLikeButton from '@/components/Button/domain/FloatingButton/FloatingLikeButton';
import Toast from '@/components/toast/Toast';
import WarningModal from '@/components/Modal/domain/components/WarningModal/WarningModal';
import { useDeleteArticle, useLikeArticle } from '../hooks/useArticles';
import { useCreateComment, useUpdateComment, useDeleteComment } from '../hooks/useComments';
import type { ArticleDetail } from '../apis/types';
import type { Comment } from '../apis/comments';
import kebabIcon from '@/assets/icons/kebab/kebabLarge.svg';
import emptyHeartIcon from '@/assets/icons/heart/emptyHeartLarge.svg';
import fullHeartIcon from '@/assets/icons/heart/fullHeartLarge.svg';
import humanBig from '@/assets/buttons/human/humanBig.svg';
import styles from './ArticleDetailPage.module.css';

function renderAvatar(image: string | null, size = 32) {
  if (image) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}
      >
        <Image
          src={image}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
    );
  }
  return <Image src={humanBig} alt="" width={size} height={size} />;
}

interface ArticleDetailPageProps {
  article: ArticleDetail;
  comments?: Comment[];
  currentUserImage?: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

export default function ArticleDetailPage({
  article,
  comments = [],
  currentUserImage,
}: ArticleDetailPageProps) {
  const router = useRouter();
  const [commentInput, setCommentInput] = useState('');

  // Mutations
  const deleteArticleMutation = useDeleteArticle();
  const likeMutation = useLikeArticle();
  const createCommentMutation = useCreateComment(article.id);
  const updateCommentMutation = useUpdateComment(article.id);
  const deleteCommentMutation = useDeleteComment(article.id);

  // Article kebab menu
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const articleMenuRef = useRef<HTMLDivElement>(null);

  // Comment kebab menus
  const [activeCommentMenu, setActiveCommentMenu] = useState<number | null>(null);
  const commentMenuRef = useRef<HTMLDivElement>(null);

  // Comment editing
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Modal & Toast
  const [deleteModal, setDeleteModal] = useState<{
    type: 'article' | 'comment';
    commentId?: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (articleMenuRef.current && !articleMenuRef.current.contains(e.target as Node)) {
        setShowArticleMenu(false);
      }
      if (commentMenuRef.current && !commentMenuRef.current.contains(e.target as Node)) {
        setActiveCommentMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(null);
    setTimeout(() => setToastMessage(message), 0);
  };

  const handleCommentSubmit = () => {
    if (!commentInput.trim()) return;
    createCommentMutation.mutate(commentInput.trim(), {
      onSuccess: () => setCommentInput(''),
      onError: () => showToast('댓글 작성에 실패했습니다.'),
    });
  };

  const handleLikeToggle = () => {
    likeMutation.mutate({ articleId: article.id, isLiked: article.isLiked });
  };

  const handleArticleDelete = () => {
    setDeleteModal({ type: 'article' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal) return;

    if (deleteModal.type === 'article') {
      deleteArticleMutation.mutate(article.id, {
        onSuccess: () => {
          setDeleteModal(null);
          router.push('/boards');
        },
        onError: () => {
          setDeleteModal(null);
          showToast('게시글 삭제에 실패했습니다.');
        },
      });
    } else if (deleteModal.type === 'comment' && deleteModal.commentId) {
      deleteCommentMutation.mutate(deleteModal.commentId, {
        onSuccess: () => setDeleteModal(null),
        onError: () => {
          setDeleteModal(null);
          showToast('댓글 삭제에 실패했습니다.');
        },
      });
    }
    setActiveCommentMenu(null);
  };

  const handleCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setActiveCommentMenu(null);
  };

  const handleCommentEditSubmit = () => {
    if (!editingCommentId || !editingContent.trim()) return;
    updateCommentMutation.mutate(
      { commentId: editingCommentId, content: editingContent.trim() },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingContent('');
        },
        onError: () => showToast('댓글 수정에 실패했습니다.'),
      },
    );
  };

  const handleCommentDelete = (commentId: number) => {
    setDeleteModal({ type: 'comment', commentId });
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <article className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.kebabWrapper} ref={articleMenuRef}>
              <button
                type="button"
                className={styles.kebabButton}
                aria-label="더보기"
                onClick={() => setShowArticleMenu((prev) => !prev)}
              >
                <Image src={kebabIcon} alt="" width={24} height={24} />
              </button>
              {showArticleMenu && (
                <div className={styles.kebabMenu}>
                  <button
                    type="button"
                    className={styles.kebabMenuItem}
                    onClick={() => {
                      setShowArticleMenu(false);
                      router.push(`/boards/${article.id}/edit`);
                    }}
                  >
                    수정하기
                  </button>
                  <button
                    type="button"
                    className={`${styles.kebabMenuItem} ${styles.kebabMenuDanger}`}
                    onClick={() => {
                      setShowArticleMenu(false);
                      handleArticleDelete();
                    }}
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.authorRow}>
            {renderAvatar(article.writer.image)}
            <span className={styles.nickname}>{article.writer.nickname}</span>
            <span className={styles.divider}>|</span>
            <time className={styles.date} dateTime={article.createdAt}>
              {formatDate(article.createdAt)}
            </time>
          </div>

          <hr className={styles.separator} />

          <div className={styles.body}>
            {article.content && <p className={styles.text}>{article.content}</p>}
            {article.image && (
              <div className={styles.imageWrapper}>
                <img src={article.image} alt="" className={styles.articleImage} />
              </div>
            )}
            <div className={styles.inlineLike}>
              <button
                type="button"
                className={styles.likeButton}
                onClick={handleLikeToggle}
                aria-label={article.isLiked ? '좋아요 취소' : '좋아요'}
                aria-pressed={article.isLiked}
              >
                <Image
                  src={article.isLiked ? fullHeartIcon : emptyHeartIcon}
                  alt=""
                  width={20}
                  height={20}
                />
                <span>{article.likeCount > 999 ? '999+' : article.likeCount}</span>
              </button>
            </div>
          </div>

          <section className={styles.commentSection}>
            <h2 className={styles.commentTitle}>
              댓글 <span className={styles.commentCount}>{comments.length}</span>
            </h2>
            <CommentInput
              placeholder="댓글을 입력해주세요"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onSubmit={handleCommentSubmit}
              profileImage={renderAvatar(currentUserImage ?? null)}
            />

            {comments.length > 0 ? (
              <div className={styles.commentList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    {editingCommentId === comment.id ? (
                      <div className={styles.commentEditForm}>
                        {renderAvatar(comment.writer.image)}
                        <div className={styles.commentEditBody}>
                          <textarea
                            className={styles.commentEditTextarea}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                          <div className={styles.commentEditActions}>
                            <button
                              type="button"
                              className={styles.commentEditCancel}
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingContent('');
                              }}
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              className={styles.commentEditSave}
                              onClick={handleCommentEditSubmit}
                              disabled={!editingContent.trim()}
                            >
                              수정하기
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <CommentCard
                        profileImage={renderAvatar(comment.writer.image)}
                        name={comment.writer.nickname}
                        content={comment.content}
                        date={formatDate(comment.createdAt)}
                        dateTime={comment.createdAt}
                        icon={
                          <div
                            className={styles.kebabWrapper}
                            ref={activeCommentMenu === comment.id ? commentMenuRef : undefined}
                          >
                            <button
                              type="button"
                              className={styles.kebabButton}
                              aria-label="더보기"
                              onClick={() =>
                                setActiveCommentMenu((prev) =>
                                  prev === comment.id ? null : comment.id,
                                )
                              }
                            >
                              <Image src={kebabIcon} alt="" width={24} height={24} />
                            </button>
                            {activeCommentMenu === comment.id && (
                              <div className={styles.kebabMenu}>
                                <button
                                  type="button"
                                  className={styles.kebabMenuItem}
                                  onClick={() => handleCommentEdit(comment)}
                                >
                                  수정하기
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.kebabMenuItem} ${styles.kebabMenuDanger}`}
                                  onClick={() => handleCommentDelete(comment.id)}
                                >
                                  삭제하기
                                </button>
                              </div>
                            )}
                          </div>
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyComment}>아직 작성된 댓글이 없습니다.</p>
            )}
          </section>
        </article>

        <div className={styles.floatingWrapper}>
          <FloatingLikeButton
            isLiked={article.isLiked}
            count={article.likeCount}
            onToggle={handleLikeToggle}
          />
        </div>
      </div>

      <WarningModal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        text={{
          title:
            deleteModal?.type === 'article' ? '게시글을 삭제하시겠어요?' : '댓글을 삭제하시겠어요?',
          description:
            deleteModal?.type === 'article'
              ? '삭제된 게시글은 복구할 수 없습니다.'
              : '삭제된 댓글은 복구할 수 없습니다.',
          closeLabel: '취소',
          confirmLabel: '삭제하기',
        }}
      />

      {toastMessage && (
        <div className={styles.toastWrapper}>
          <Toast
            isOpen
            message={toastMessage}
            actionLabel=""
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}
    </div>
  );
}
