import "../index.css";

type Props = {
  title: string;
  image: string;
};

export default function NFTCard({ title, image }: Props) {
  return (
    <div className="nft-card">
      <img src={image} alt={title} className="nft-image" />
      <h3>{title}</h3>
    </div>
  );
}
