import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCharacter } from '../../../../lib/fetchCharacter';
import '../../../../components/CharacterDetails/CharacterDetails.css';
import './details.css';

interface DetailsPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function CharacterDetailsPage({ params, searchParams }: DetailsPageProps) {
  const { locale, id } = await params;
  const { page = '1', q = '' } = await searchParams;

  const numericId = Number(id);
  if (!numericId || numericId < 1) notFound();

  const character = await fetchCharacter(numericId);
  if (!character) notFound();

  const backParams = new URLSearchParams({ page });
  if (q) backParams.set('q', q);
  const backUrl = `/${locale}?${backParams.toString()}`;

  return (
    <div className="details-page">
      <Link href={backUrl} className="character-details__back" aria-label="Close details">
        ← Back
      </Link>
      <div className="character-details">
        <div className="character-details__content">
          <Image
            className="character-details__image"
            src={character.image}
            alt={character.name}
            width={200}
            height={200}
          />
          <h2 className="character-details__name">{character.name}</h2>
          <dl className="character-details__info">
            <div className="character-details__row">
              <dt>Status</dt>
              <dd>{character.status}</dd>
            </div>
            <div className="character-details__row">
              <dt>Species</dt>
              <dd>{character.species}</dd>
            </div>
            <div className="character-details__row">
              <dt>Gender</dt>
              <dd>{character.gender}</dd>
            </div>
            <div className="character-details__row">
              <dt>Origin</dt>
              <dd>{character.origin.name}</dd>
            </div>
            <div className="character-details__row">
              <dt>Location</dt>
              <dd>{character.location.name}</dd>
            </div>
            {character.type && (
              <div className="character-details__row">
                <dt>Type</dt>
                <dd>{character.type}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
