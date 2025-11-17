import type { Ability, Pokemon } from '~/types/types';

export const pokemons: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    abilities: [
      {
        ability: {
          name: 'overgrow',
          url: 'https://pokeapi.co/api/v2/ability/65/',
        },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: {
          name: 'chlorophyll',
          url: 'https://pokeapi.co/api/v2/ability/34/',
        },
        is_hidden: true,
        slot: 3,
      },
    ],
    forms: [
      {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon-form/1/',
      },
    ],
    height: 7,
  },
  {
    id: 2,
    name: 'Charmander',
    abilities: [
      {
        ability: {
          name: 'blaze',
          url: 'https://pokeapi.co/api/v2/ability/66/',
        },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: {
          name: 'solar-power',
          url: 'https://pokeapi.co/api/v2/ability/94/',
        },
        is_hidden: true,
        slot: 3,
      },
    ],
    forms: [
      {
        name: 'ivysaur',
        url: 'https://pokeapi.co/api/v2/pokemon-form/2/',
      },
    ],
    height: 10,
  },
];

export const abilities: Ability[] = [
  {
    id: 66,
    is_main_series: true,
    name: 'blaze',
    effect_entries: [
      {
        effect:
          'Wenn ein Pokémon mit dieser Fähigkeit nur noch 1/3 seiner maximalen hp oder weniger hat, werden all seine fire Attacken verstärkt, so dass sie 1,5× so viel regular damage anrichten wie sonst.',
        language: {
          name: 'de',
          url: 'https://pokeapi.co/api/v2/language/6/',
        },
        short_effect:
          'Erhöht den Schaden von fire Attacken um 50% wenn nur noch 1/3 der maximalen hp oder weniger übrig sind.',
      },
      {
        effect:
          'When this Pokémon has 1/3 or less of its HP remaining, its fire-type moves inflict 1.5× as much regular damage.',
        language: {
          name: 'en',
          url: 'https://pokeapi.co/api/v2/language/9/',
        },
        short_effect:
          'Strengthens fire moves to inflict 1.5× damage at 1/3 max HP or less.',
      },
    ],
    pokemon: [
      {
        is_hidden: false,
        pokemon: {
          name: 'charmander',
          url: 'https://pokeapi.co/api/v2/pokemon/4/',
        },
        slot: 1,
      },
      {
        is_hidden: false,
        pokemon: {
          name: 'charmeleon',
          url: 'https://pokeapi.co/api/v2/pokemon/5/',
        },
        slot: 1,
      },
    ],
  },
];
