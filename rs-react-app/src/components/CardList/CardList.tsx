import type { Character } from '../../api/rickmorty';
import Card from '../Card/Card';
import './CardList.css';

interface CardListProps {
  characters: Character[];
}

function CardList({ characters }: CardListProps) {
  if (characters.length === 0) {
    return (
      <div className="card-list__empty">
        <p>No characters found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <ul className="card-list">
      {characters.map((character) => (
        <li key={character.id} className="card-list__item">
          <Card character={character} />
        </li>
      ))}
    </ul>
  );
}

export default CardList;
