import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCharacterById } from '../../api/rickmorty';
import type { Character } from '../../api/rickmorty';
import Spinner from '../Spinner/Spinner';
import './CharacterDetails.css';

function CharacterDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fetchedForId, setFetchedForId] = useState<string | undefined>(undefined);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state: reset to loading when id changes, during render (no effect needed).
  // React re-renders synchronously on this setState and discards the stale render.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (id !== fetchedForId) {
    setFetchedForId(id);
    setCharacter(null);
    setIsLoading(true);
    setError(null);
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    fetchCharacterById(Number(id))
      .then((data) => {
        if (!cancelled) {
          setCharacter(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load character');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleClose = () => {
    const search = searchParams.toString();
    navigate({ pathname: '/', search: search ? `?${search}` : '' });
  };

  return (
    <div className="character-details">
      <button
        className="character-details__close"
        type="button"
        onClick={handleClose}
        aria-label="Close details"
      >
        ×
      </button>

      {isLoading && <Spinner />}

      {!isLoading && error && (
        <p className="character-details__error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && character && (
        <div className="character-details__content">
          <img
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
      )}
    </div>
  );
}

export default CharacterDetails;
