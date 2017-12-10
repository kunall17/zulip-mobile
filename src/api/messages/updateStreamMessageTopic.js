/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, subject: string, id: number) =>
  apiPatch(auth, `messages/${id}`, res => res, {
    subject,
  });
