import { Edit, MapPinned, Navigation, Trash2 } from "lucide-react";
import { imageUrl } from "../api/client";

export default function PostCard({ post, onDelete, onEdit, canDelete, canEdit }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`;

  return (
    <article className="panel flex flex-col gap-3">
      {post.image && (
        <img src={imageUrl(post.image)} alt={post.title} className="h-56 w-full rounded-md object-cover" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">{post.title}</h2>
          <p className="text-sm text-gray-500">By {post.userId?.name || "Community member"}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button className="btn-secondary" onClick={() => onEdit(post)} title="Edit post">
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button className="btn-danger" onClick={() => onDelete(post._id)} title="Delete post">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm leading-6 text-gray-700">{post.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinned className="h-4 w-4 text-emerald-700" />
          {post.location.address || `${post.location.lat}, ${post.location.lng}`}
        </span>
        <a className="btn-primary" href={directionsUrl} target="_blank" rel="noreferrer">
          <Navigation className="h-4 w-4" />
          View Location
        </a>
      </div>
    </article>
  );
}
