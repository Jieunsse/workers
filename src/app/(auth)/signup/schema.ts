import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일은 필수 입력입니다.')
      .pipe(z.email('이메일 형식으로 작성해 주세요.')),

    nickname: z.string().min(1, '이름을 입력해 주세요.').max(30, '이름은 30자 이하여야 합니다.'),

    password: z
      .string()
      .min(1, '비밀번호는 필수 입력입니다.')
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(
        /^([a-z]|[A-Z]|[0-9]|[!@#$%^&*])+$/,
        '비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)만 사용할 수 있습니다.',
      ),

    passwordConfirmation: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirmation'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
