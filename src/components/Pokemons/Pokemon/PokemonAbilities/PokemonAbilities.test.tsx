import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { abilities } from '~/test-utils/fixtures';
import PokemonAbilities from './PokemonAbilities';

const expectedNames = abilities.map((ability) =>
  ability.name.replace('-', ' ')
);
const expectedShortEffectsDE = abilities.map(
  (ability) => ability.effect_entries[0].short_effect
);
const expectedShortEffectsEN = abilities.map(
  (ability) => ability.effect_entries[1].short_effect
);

test('should render abilities', async () => {
  render(<PokemonAbilities abilities={abilities} />);

  const abilityName1 = screen.getByText(expectedNames[0], { exact: false });
  const abilitySortEffect1 = screen.getByText(expectedShortEffectsEN[0], {
    exact: false,
  });
  const abilityName2 = screen.getByText(expectedNames[1], {
    exact: false,
  });
  const abilitySortEffect2 = screen.getByText(expectedShortEffectsEN[1], {
    exact: false,
  });

  expect(abilityName1).toBeInTheDocument();
  expect(abilitySortEffect1).toBeInTheDocument();
  expect(abilityName2).toBeInTheDocument();
  expect(abilitySortEffect2).toBeInTheDocument();
});

test('should render abilities in user language', () => {
  render(<PokemonAbilities abilities={abilities} lang="de" />);

  const abilityName1 = screen.getByText(expectedNames[0], { exact: false });
  const abilitySortEffect1 = screen.getByText(expectedShortEffectsDE[0], {
    exact: false,
  });
  const abilityName2 = screen.getByText(expectedNames[1], {
    exact: false,
  });
  const abilitySortEffect2 = screen.getByText(expectedShortEffectsDE[1], {
    exact: false,
  });

  expect(abilityName1).toBeInTheDocument();
  expect(abilitySortEffect1).toBeInTheDocument();
  expect(abilityName2).toBeInTheDocument();
  expect(abilitySortEffect2).toBeInTheDocument();
});
