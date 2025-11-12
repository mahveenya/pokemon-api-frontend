import type { Pokemon } from '~/types/types';

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
        name: 'ivysaur',
        url: 'https://pokeapi.co/api/v2/pokemon-form/2/',
      },
    ],
    height: 10,
  },
];
