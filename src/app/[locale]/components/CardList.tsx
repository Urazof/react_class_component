import type { Character } from '../../../api/rickmorty';
import Card from './Card';
import '../../../components/CardList/CardList.css';

interface CardListProps {
  characters: Character[];
  locale: string;
  currentPage: number;
  searchTerm: string;
  notFoundMessage: string;
}

function CardList({ characters, locale, currentPage, searchTerm, notFoundMessage }: CardListProps) {
  if (characters.length === 0) {
    return (
      <div className="card-list__empty">
        <p>{notFoundMessage}</p>
      </div>
    );
  }

  return (
    <ul className="card-list">
      {characters.map((character) => (
        <li key={character.id} className="card-list__item">
          <Card
            character={character}
            locale={locale}
            currentPage={currentPage}
            searchTerm={searchTerm}
          />
        </li>
      ))}
    </ul>
  );
}

export default CardList;
