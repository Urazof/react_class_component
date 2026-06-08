import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCharacterByIdQuery, getQueryErrorMessage } from '../../store/api/rickmortyApi';
import Spinner from '../Spinner/Spinner';
import './CharacterDetails.css';

function CharacterDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const numericId = Number(id);
  const { data: character, isLoading, isError, error } = useGetCharacterByIdQuery(numericId, {
    skip: !id,
  });

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

      {!isLoading && isError && (
        <p className="character-details__error" role="alert">
          {getQueryErrorMessage(error)}
        </p>
      )}

      {!isLoading && !isError && character && (
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
