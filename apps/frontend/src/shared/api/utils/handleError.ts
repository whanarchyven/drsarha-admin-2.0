import { redirect } from 'next/navigation';

export const handleError = (error: any) => {
  redirect(
    `/error?code=${error.status}&message=${JSON.stringify(error.value)}`
  );
};
