export function _biosBerekenBestelling(
    _biosCategorieen,
    _biosAanvangstijd,
    _biosAantalPopcorn,
    _biosAantalFrisdrank,
    _biosPrijzen
) {
    const _biosKaartjesBasisprijs = _biosCategorieen.reduce(
        (_biosTotaal, _biosCategorie) =>
            _biosTotaal +
            _biosPrijzen.kaartjes[_biosCategorie],
        0
    );

    const _biosIsAvondvoorstelling =
        _biosAanvangstijd > _biosPrijzen.avondtoeslag_na;

    const _biosAvondtoeslag = _biosIsAvondvoorstelling
        ? _biosCategorieen.length *
        _biosPrijzen.avondtoeslag_per_bezoeker
        : 0;

    const _biosKaartjesVoorKorting =
        _biosKaartjesBasisprijs + _biosAvondtoeslag;

    const _biosHeeftGroepskorting =
        _biosCategorieen.length >=
        _biosPrijzen.groepskorting_vanaf_bezoekers;

    const _biosGroepskorting = _biosHeeftGroepskorting
        ? _biosKaartjesVoorKorting *
        (_biosPrijzen.groepskorting_percentage / 100)
        : 0;

    const _biosPopcornTotaal =
        _biosAantalPopcorn * _biosPrijzen.snacks.popcorn;

    const _biosFrisdrankTotaal =
        _biosAantalFrisdrank * _biosPrijzen.snacks.frisdrank;

    const _biosSnacksTotaal =
        _biosPopcornTotaal + _biosFrisdrankTotaal;

    const _biosTotaal =
        _biosKaartjesVoorKorting -
        _biosGroepskorting +
        _biosSnacksTotaal;

    return {
        kaartjesBasisprijs: _biosKaartjesBasisprijs,
        avondtoeslag: _biosAvondtoeslag,
        kaartjesVoorKorting: _biosKaartjesVoorKorting,
        groepskorting: _biosGroepskorting,
        popcornTotaal: _biosPopcornTotaal,
        frisdrankTotaal: _biosFrisdrankTotaal,
        snacksTotaal: _biosSnacksTotaal,
        totaal: _biosTotaal,
        isAvondvoorstelling: _biosIsAvondvoorstelling,
        heeftGroepskorting: _biosHeeftGroepskorting
    };
}