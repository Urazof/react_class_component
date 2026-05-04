import { Character } from '../../api/rickmorty';
import './Card.css';

interface CardProps {
  character: Character;
}

function Card({ character }: CardProps) {
  const description = [character.species, character.status, character.gender]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="card">
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
    </div>
  );
}

export default Card;
