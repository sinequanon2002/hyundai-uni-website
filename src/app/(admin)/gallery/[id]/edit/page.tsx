import { redirect } from "next/navigation";
export default function OldAdminGalleryEditPage({ params }: { params: { id: string } }) {
  redirect(`/admin/gallery/${params.id}/edit`);
}
