import type { Character } from '../../api/rickmorty';
import './Card.css';

interface CardProps {
  character: Character;
  onClick?: (id: number) => void;
}

function Card({ character, onClick }: CardProps) {
  const description = [character.species, character.status, character.gender]
    .filter(Boolean)
    .join(' · ');

  const handleClick = (e: React.MouseEvent) => {
    // stopPropagation: не даём клику всплыть до обработчика закрытия деталей в MainPage
    e.stopPropagation();
    onClick?.(character.id);
  };

  return (
    <article
      className={`card${onClick ? ' card--clickable' : ''}`}
      onClick={handleClick}
      role="article"
    >
      <img
        className="card__image"
        src={character.image}
        alt={character.name}
        width={100}
        height={100}
      />
      <div className="card__body">
        <h3 className="card__name">{character.name}</h3>
        <p className="card__description">{description}</p>
        <p className="card__origin">{character.origin.name}</p>
      </div>
    </article>
  );
}

export default Card;
