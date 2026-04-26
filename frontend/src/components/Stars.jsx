export default function Stars({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={
            i <= Math.floor(rating)
              ? "star full"
              : i === Math.ceil(rating) && rating % 1 >= 0.5
              ? "star half"
              : "star empty"
          }
        >
          {i <= Math.floor(rating) || (i === Math.ceil(rating) && rating % 1 >= 0.5) ? "★" : "☆"}
        </i>
      ))}
    </span>
  );
}
