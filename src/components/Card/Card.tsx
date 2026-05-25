import type { Character } from '../../api/rickmorty';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSelected, selectIsSelected } from '../../store/selectionSlice';
import './Card.css';

interface CardProps {
  character: Character;
  onClick?: (id: number) => void;
}

function Card({ character, onClick }: CardProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsSelected(character.id));

  const description = [character.species, character.status, character.gender]
    .filter(Boolean)
    .join(' · ');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(character.id);
  };

  return (
    <article
      className={`card${onClick ? ' card--clickable' : ''}${isSelected ? ' card--selected' : ''}`}
      onClick={handleClick}
      role="article"
    >
      <input
        type="checkbox"
        className="card__checkbox"
        checked={isSelected}
        onChange={() => dispatch(toggleSelected(character))}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${character.name}`}
      />
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
