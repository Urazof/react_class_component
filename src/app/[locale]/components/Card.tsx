'use client';

import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { toggleSelected, selectIsSelected } from '../../../store/selectionSlice';
import { selectCharacterAction } from '../../actions/selectCharacter';
import type { Character } from '../../../api/rickmorty';
import '../../../components/Card/Card.css';

interface CardProps {
  character: Character;
  locale: string;
  currentPage: number;
  searchTerm: string;
}

function Card({ character, locale, currentPage, searchTerm }: CardProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsSelected(character.id));

  const description = [character.species, character.status, character.gender]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`card card--clickable${isSelected ? ' card--selected' : ''}`}
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
      <form action={selectCharacterAction} className="card__link">
        <input type="hidden" name="id" value={character.id} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="page" value={currentPage} />
        <input type="hidden" name="q" value={searchTerm} />
        <button
          type="submit"
          className="card__click-area"
          aria-label={`View details for ${character.name}`}
        >
          <Image
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
        </button>
      </form>
    </article>
  );
}

export default Card;
