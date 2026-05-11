import { redirect } from "next/navigation";

export default function OldBlogDetailPage({ params }: { params: { id: string } }) {
  redirect(`/blog/${params.id}`);
}
