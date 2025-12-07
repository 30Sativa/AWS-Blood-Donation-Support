import { useParams } from "react-router-dom";

export default function MatchDetail() {
  const { id } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Match Detail</h1>
      <p className="mt-4 text-gray-600">Match ID: {id}</p>
    </div>
  );
}
