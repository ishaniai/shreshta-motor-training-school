/** Login form — Step 3 UI; auth API wired in next step */
export interface LoginFormState {
  /** Username or email address */
  usernameOrEmail: string;
  password: string;
}

export const initialLoginForm: LoginFormState = {
  usernameOrEmail: "",
  password: "",
};
