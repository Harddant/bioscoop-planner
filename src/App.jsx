/* eslint-disable react-hooks/rules-of-hooks */

import { useState as _biosUseState } from "react";
import "./App.css";
import _biosGegevens from "./data/bioscoop.json";
import { _biosBerekenBestelling } from "./utils/prijsBerekening.js";

function _biosApp() {
  const [_biosGeselecteerdeFilmId, _biosSetGeselecteerdeFilmId] =
      _biosUseState(null);

  const [
    _biosGeselecteerdeVoorstellingId,
    _biosSetGeselecteerdeVoorstellingId
  ] = _biosUseState(null);

  const [_biosAantalBezoekers, _biosSetAantalBezoekers] =
      _biosUseState("1");

  const [_biosCategorieen, _biosSetCategorieen] =
      _biosUseState([""]);

  const [_biosAantalPopcorn, _biosSetAantalPopcorn] =
      _biosUseState("0");

  const [_biosAantalFrisdrank, _biosSetAantalFrisdrank] =
      _biosUseState("0");

  const [_biosFoutmelding, _biosSetFoutmelding] =
      _biosUseState("");

  const [_biosBestelling, _biosSetBestelling] =
      _biosUseState(null);

  const _biosFilms = _biosGegevens.films;

  const _biosGeselecteerdeFilm = _biosFilms.find(
      (_biosFilm) => _biosFilm.id === _biosGeselecteerdeFilmId
  );

  const _biosBeschikbareVoorstellingen =
      _biosGegevens.voorstellingen.filter(
          (_biosVoorstelling) =>
              _biosVoorstelling.film_id ===
              _biosGeselecteerdeFilmId
      );

  const _biosGeselecteerdeVoorstelling =
      _biosGegevens.voorstellingen.find(
          (_biosVoorstelling) =>
              _biosVoorstelling.id ===
              _biosGeselecteerdeVoorstellingId
      );

  function _biosResetFormulier() {
    _biosSetAantalBezoekers("1");
    _biosSetCategorieen([""]);
    _biosSetAantalPopcorn("0");
    _biosSetAantalFrisdrank("0");
    _biosSetFoutmelding("");
    _biosSetBestelling(null);
  }

  function _biosSelecteerFilm(_biosFilmId) {
    _biosSetGeselecteerdeFilmId(_biosFilmId);
    _biosSetGeselecteerdeVoorstellingId(null);
    _biosResetFormulier();
  }

  function _biosSelecteerVoorstelling(_biosVoorstellingId) {
    _biosSetGeselecteerdeVoorstellingId(
        _biosVoorstellingId
    );

    _biosResetFormulier();
  }

  function _biosZoekZaal(_biosZaalId) {
    return _biosGegevens.zalen.find(
        (_biosZaal) => _biosZaal.id === _biosZaalId
    );
  }

  function _biosFormatteerDatum(_biosDatum) {
    return new Intl.DateTimeFormat("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date(_biosDatum));
  }

  function _biosFormatteerPrijs(_biosBedrag) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: _biosGegevens.bioscoop.valuta
    }).format(_biosBedrag);
  }

  function _biosWijzigAantalBezoekers(_biosEvent) {
    const _biosNieuweWaarde = _biosEvent.target.value;
    const _biosNieuwAantal = Number(_biosNieuweWaarde);

    _biosSetAantalBezoekers(_biosNieuweWaarde);
    _biosSetBestelling(null);
    _biosSetFoutmelding("");

    if (
        Number.isInteger(_biosNieuwAantal) &&
        _biosNieuwAantal >= 1 &&
        _biosNieuwAantal <=
        _biosGegevens.instellingen
            .maximum_bezoekers_per_reservering
    ) {
      _biosSetCategorieen(
          (_biosVorigeCategorieen) =>
              Array.from(
                  { length: _biosNieuwAantal },
                  (_biosWaarde, _biosIndex) =>
                      _biosVorigeCategorieen[
                          _biosIndex
                          ] ?? ""
              )
      );
    }
  }

  function _biosWijzigCategorie(
      _biosBezoekerIndex,
      _biosCategorie
  ) {
    _biosSetCategorieen(
        (_biosVorigeCategorieen) =>
            _biosVorigeCategorieen.map(
                (_biosVorigeCategorie, _biosIndex) =>
                    _biosIndex === _biosBezoekerIndex
                        ? _biosCategorie
                        : _biosVorigeCategorie
            )
    );

    _biosSetBestelling(null);
    _biosSetFoutmelding("");
  }

  function _biosWijzigPopcorn(_biosEvent) {
    _biosSetAantalPopcorn(_biosEvent.target.value);
    _biosSetBestelling(null);
    _biosSetFoutmelding("");
  }

  function _biosWijzigFrisdrank(_biosEvent) {
    _biosSetAantalFrisdrank(_biosEvent.target.value);
    _biosSetBestelling(null);
    _biosSetFoutmelding("");
  }

  function _biosMaakCategorieOverzicht(
      _biosGekozenCategorieen
  ) {
    return _biosGekozenCategorieen.reduce(
        (_biosOverzicht, _biosCategorie) => {
          _biosOverzicht[_biosCategorie] =
              (_biosOverzicht[_biosCategorie] ?? 0) + 1;

          return _biosOverzicht;
        },
        {}
    );
  }

  function _biosControleerEnBereken(_biosEvent) {
    _biosEvent.preventDefault();
    _biosSetFoutmelding("");
    _biosSetBestelling(null);

    const _biosAantal = Number(_biosAantalBezoekers);
    const _biosPopcorn = Number(_biosAantalPopcorn);
    const _biosFrisdrank = Number(_biosAantalFrisdrank);
    const _biosMaximum =
        _biosGegevens.instellingen
            .maximum_bezoekers_per_reservering;

    if (!_biosGeselecteerdeFilm) {
      _biosSetFoutmelding(
          "Kies eerst een film."
      );
      return;
    }

    if (!_biosGeselecteerdeVoorstelling) {
      _biosSetFoutmelding(
          "Kies eerst een voorstelling."
      );
      return;
    }

    if (
        !Number.isInteger(_biosAantal) ||
        _biosAantal < 1 ||
        _biosAantal > _biosMaximum
    ) {
      _biosSetFoutmelding(
          `Het aantal bezoekers moet tussen 1 en ${_biosMaximum} liggen.`
      );
      return;
    }

    const _biosZaal = _biosZoekZaal(
        _biosGeselecteerdeVoorstelling.zaal_id
    );

    if (_biosAantal > _biosZaal.capaciteit) {
      _biosSetFoutmelding(
          `Deze zaal heeft maximaal ${_biosZaal.capaciteit} plaatsen.`
      );
      return;
    }

    if (
        _biosCategorieen.length !== _biosAantal ||
        _biosCategorieen.some(
            (_biosCategorie) => _biosCategorie === ""
        )
    ) {
      _biosSetFoutmelding(
          "Kies voor iedere bezoeker een leeftijdscategorie."
      );
      return;
    }

    if (
        !Number.isInteger(_biosPopcorn) ||
        _biosPopcorn < 0
    ) {
      _biosSetFoutmelding(
          "Het aantal popcorn moet nul of een positief geheel getal zijn."
      );
      return;
    }

    if (
        !Number.isInteger(_biosFrisdrank) ||
        _biosFrisdrank < 0
    ) {
      _biosSetFoutmelding(
          "Het aantal frisdranken moet nul of een positief geheel getal zijn."
      );
      return;
    }

    const _biosBerekening = _biosBerekenBestelling(
        _biosCategorieen,
        _biosGeselecteerdeVoorstelling.aanvangstijd,
        _biosPopcorn,
        _biosFrisdrank,
        _biosGegevens.prijzen
    );

    const _biosCategorieOverzicht =
        _biosMaakCategorieOverzicht(
            _biosCategorieen
        );

    _biosSetBestelling({
      film: _biosGeselecteerdeFilm,
      voorstelling: _biosGeselecteerdeVoorstelling,
      zaal: _biosZaal,
      aantalBezoekers: _biosAantal,
      categorieen: [..._biosCategorieen],
      categorieOverzicht: _biosCategorieOverzicht,
      aantalPopcorn: _biosPopcorn,
      aantalFrisdrank: _biosFrisdrank,
      berekening: _biosBerekening
    });
  }

  return (
      <main className="_biosPagina">
        <header className="_biosHeader">
          <p className="_biosBioscoopNaam">
            {_biosGegevens.bioscoop.naam}
          </p>

          <h1>Slimme bioscoopplanner</h1>

          <p>
            Kies een film, een voorstelling en stel
            daarna je bestelling samen.
          </p>
        </header>

        <section className="_biosSectie">
          <h2>1. Kies een film</h2>

          <div className="_biosFilmLijst">
            {_biosFilms.map((_biosFilm) => {
              const _biosIsGeselecteerd =
                  _biosFilm.id ===
                  _biosGeselecteerdeFilmId;

              return (
                  <button
                      className={`_biosFilmKaart ${
                          _biosIsGeselecteerd
                              ? "_biosGeselecteerd"
                              : ""
                      }`}
                      key={_biosFilm.id}
                      type="button"
                      aria-pressed={
                        _biosIsGeselecteerd
                      }
                      onClick={() =>
                          _biosSelecteerFilm(
                              _biosFilm.id
                          )
                      }
                  >
                    <h3>{_biosFilm.titel}</h3>

                    <p>
                      Speelduur:{" "}
                      {_biosFilm.duur_minuten}{" "}
                      minuten
                    </p>

                    <p>
                      Minimumleeftijd:{" "}
                      {
                        _biosFilm.minimumleeftijd
                      }{" "}
                      jaar
                    </p>
                  </button>
              );
            })}
          </div>
        </section>

        {_biosGeselecteerdeFilm && (
            <section className="_biosSectie">
              <h2>
                2. Kies een voorstelling van{" "}
                {_biosGeselecteerdeFilm.titel}
              </h2>

              <div className="_biosVoorstellingenLijst">
                {_biosBeschikbareVoorstellingen.map(
                    (_biosVoorstelling) => {
                      const _biosZaal =
                          _biosZoekZaal(
                              _biosVoorstelling.zaal_id
                          );

                      const _biosIsGeselecteerd =
                          _biosVoorstelling.id ===
                          _biosGeselecteerdeVoorstellingId;

                      return (
                          <button
                              className={`_biosVoorstelling ${
                                  _biosIsGeselecteerd
                                      ? "_biosGeselecteerd"
                                      : ""
                              }`}
                              key={
                                _biosVoorstelling.id
                              }
                              type="button"
                              aria-pressed={
                                _biosIsGeselecteerd
                              }
                              onClick={() =>
                                  _biosSelecteerVoorstelling(
                                      _biosVoorstelling.id
                                  )
                              }
                          >
                            <p>
                              <strong>
                                Datum:
                              </strong>{" "}
                              {_biosFormatteerDatum(
                                  _biosVoorstelling.datum
                              )}
                            </p>

                            <p>
                              <strong>
                                Tijd:
                              </strong>{" "}
                              {
                                _biosVoorstelling
                                    .aanvangstijd
                              }
                            </p>

                            <p>
                              <strong>
                                Zaal:
                              </strong>{" "}
                              {_biosZaal.naam}
                            </p>

                            <p>
                              <strong>
                                Capaciteit:
                              </strong>{" "}
                              {
                                _biosZaal.capaciteit
                              }{" "}
                              bezoekers
                            </p>
                          </button>
                      );
                    }
                )}
              </div>
            </section>
        )}

        {_biosGeselecteerdeVoorstelling && (
            <section className="_biosSectie">
              <h2>3. Stel je bestelling samen</h2>

              <div className="_biosFilmWaarschuwing">
                <strong>
                  Let op: deze film heeft een
                  minimumleeftijd van{" "}
                  {
                    _biosGeselecteerdeFilm
                        .minimumleeftijd
                  }{" "}
                  jaar.
                </strong>
              </div>

              <form
                  className="_biosFormulier"
                  onSubmit={
                    _biosControleerEnBereken
                  }
                  noValidate
              >
                <div className="_biosFormulierGroep">
                  <label htmlFor="_biosAantalBezoekers">
                    Aantal bezoekers
                  </label>

                  <input
                      id="_biosAantalBezoekers"
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      value={
                        _biosAantalBezoekers
                      }
                      onChange={
                        _biosWijzigAantalBezoekers
                      }
                  />

                  <small>
                    Minimaal 1 en maximaal 10
                    bezoekers.
                  </small>
                </div>

                <fieldset>
                  <legend>
                    Leeftijdscategorieën
                  </legend>

                  <div className="_biosCategorieLijst">
                    {_biosCategorieen.map(
                        (
                            _biosCategorie,
                            _biosIndex
                        ) => (
                            <div
                                className="_biosFormulierGroep"
                                key={
                                  _biosIndex
                                }
                            >
                              <label
                                  htmlFor={`_biosBezoeker-${_biosIndex}`}
                              >
                                Bezoeker{" "}
                                {_biosIndex +
                                    1}
                              </label>

                              <select
                                  id={`_biosBezoeker-${_biosIndex}`}
                                  value={
                                    _biosCategorie
                                  }
                                  onChange={(
                                      _biosEvent
                                  ) =>
                                      _biosWijzigCategorie(
                                          _biosIndex,
                                          _biosEvent
                                              .target
                                              .value
                                      )
                                  }
                              >
                                <option value="">
                                  Kies een
                                  categorie
                                </option>

                                <option value="kind">
                                  Kind (0–11)
                                  – €6,00
                                </option>

                                <option value="jongere">
                                  Jongere
                                  (12–17) –
                                  €8,00
                                </option>

                                <option value="volwassene">
                                  Volwassene
                                  (18–64) –
                                  €11,00
                                </option>

                                <option value="senior">
                                  Senior
                                  (65+) –
                                  €7,50
                                </option>
                              </select>
                            </div>
                        )
                    )}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Snacks</legend>

                  <div className="_biosSnackVelden">
                    <div className="_biosFormulierGroep">
                      <label htmlFor="_biosPopcorn">
                        Popcorn (€4,00)
                      </label>

                      <input
                          id="_biosPopcorn"
                          type="number"
                          min="0"
                          step="1"
                          value={
                            _biosAantalPopcorn
                          }
                          onChange={
                            _biosWijzigPopcorn
                          }
                      />
                    </div>

                    <div className="_biosFormulierGroep">
                      <label htmlFor="_biosFrisdrank">
                        Frisdrank (€3,00)
                      </label>

                      <input
                          id="_biosFrisdrank"
                          type="number"
                          min="0"
                          step="1"
                          value={
                            _biosAantalFrisdrank
                          }
                          onChange={
                            _biosWijzigFrisdrank
                          }
                      />
                    </div>
                  </div>
                </fieldset>

                {_biosFoutmelding && (
                    <p
                        className="_biosFoutmelding"
                        role="alert"
                    >
                      {_biosFoutmelding}
                    </p>
                )}

                <button
                    className="_biosBerekenKnop"
                    type="submit"
                >
                  Bestelling berekenen
                </button>
              </form>
            </section>
        )}

        {_biosBestelling && (
            <section className="_biosBesteloverzicht">
              <h2>Besteloverzicht</h2>

              <div className="_biosOverzichtBlok">
                <h3>Voorstelling</h3>

                <p>
                  <span>Film</span>
                  <strong>
                    {
                      _biosBestelling.film
                          .titel
                    }
                  </strong>
                </p>

                <p>
                  <span>Datum</span>
                  <strong>
                    {_biosFormatteerDatum(
                        _biosBestelling
                            .voorstelling.datum
                    )}
                  </strong>
                </p>

                <p>
                  <span>Aanvangstijd</span>
                  <strong>
                    {
                      _biosBestelling
                          .voorstelling
                          .aanvangstijd
                    }
                  </strong>
                </p>

                <p>
                  <span>Zaal</span>
                  <strong>
                    {
                      _biosBestelling.zaal
                          .naam
                    }
                  </strong>
                </p>
              </div>

              <div className="_biosOverzichtBlok">
                <h3>Kaartjes</h3>

                {Object.entries(
                    _biosBestelling.categorieOverzicht
                ).map(
                    ([
                       _biosCategorie,
                       _biosAantalCategorie
                     ]) => (
                        <p key={_biosCategorie}>
                                    <span>
                                        {
                                          _biosAantalCategorie
                                        }
                                      ×{" "}
                                      {_biosCategorie}
                                    </span>

                          <strong>
                            {_biosFormatteerPrijs(
                                _biosAantalCategorie *
                                _biosGegevens
                                    .prijzen
                                    .kaartjes[
                                    _biosCategorie
                                    ]
                            )}
                          </strong>
                        </p>
                    )
                )}

                <p>
                            <span>
                                Kaartjes basisprijs
                            </span>
                  <strong>
                    {_biosFormatteerPrijs(
                        _biosBestelling
                            .berekening
                            .kaartjesBasisprijs
                    )}
                  </strong>
                </p>

                <p>
                  <span>Avondtoeslag</span>
                  <strong>
                    {_biosFormatteerPrijs(
                        _biosBestelling
                            .berekening
                            .avondtoeslag
                    )}
                  </strong>
                </p>

                <p>
                  <span>Groepskorting</span>
                  <strong>
                    -
                    {_biosFormatteerPrijs(
                        _biosBestelling
                            .berekening
                            .groepskorting
                    )}
                  </strong>
                </p>
              </div>

              <div className="_biosOverzichtBlok">
                <h3>Snacks</h3>

                <p>
                            <span>
                                {
                                  _biosBestelling.aantalPopcorn
                                }
                              × popcorn
                            </span>

                  <strong>
                    {_biosFormatteerPrijs(
                        _biosBestelling
                            .berekening
                            .popcornTotaal
                    )}
                  </strong>
                </p>

                <p>
                            <span>
                                {
                                  _biosBestelling.aantalFrisdrank
                                }
                              × frisdrank
                            </span>

                  <strong>
                    {_biosFormatteerPrijs(
                        _biosBestelling
                            .berekening
                            .frisdrankTotaal
                    )}
                  </strong>
                </p>
              </div>

              <div className="_biosTotaal">
                <span>Totaalbedrag</span>

                <strong>
                  {_biosFormatteerPrijs(
                      _biosBestelling
                          .berekening.totaal
                  )}
                </strong>
              </div>
            </section>
        )}
      </main>
  );
}

export default _biosApp;