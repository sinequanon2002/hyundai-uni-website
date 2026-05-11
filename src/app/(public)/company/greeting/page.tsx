import { redirect } from 'next/navigation';
export default function GreetingRedirect() {
  redirect('/company#greeting');
}
