import type { Ability } from '~/types/ability.types';
import type { Pokemon } from '~/types/pokemon.types';

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
      },
      {
        ability: {
          name: 'chlorophyll',
          url: 'https://pokeapi.co/api/v2/ability/34/',
        },
      },
    ],
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
      },
      {
        ability: {
          name: 'solar-power',
          url: 'https://pokeapi.co/api/v2/ability/94/',
        },
      },
    ],
  },
];

export const abilities: Ability[] = [
  {
    id: 66,
    name: 'blaze',
    effect_entries: [
      {
        effect:
          'Wenn ein Pokémon mit dieser Fähigkeit nur noch 1/3 seiner maximalen hp oder weniger hat, werden all seine fire Attacken verstärkt, so dass sie 1,5× so viel regular damage anrichten wie sonst.',
        language: {
          name: 'de',
        },
        short_effect:
          'Erhöht den Schaden von fire Attacken um 50% wenn nur noch 1/3 der maximalen hp oder weniger übrig sind.',
      },
      {
        effect:
          'When this Pokémon has 1/3 or less of its HP remaining, its fire-type moves inflict 1.5x as much regular damage.',
        language: {
          name: 'en',
        },
        short_effect:
          'Strengthens fire moves to inflict 1.5x damage at 1/3 max HP or less.',
      },
    ],
  },
  {
    id: 94,
    name: 'solar-power',
    effect_entries: [
      {
        effect:
          'Während starkem Sonnenlicht, wird der special attack von Pokémon mit dieser Fähigkeit um 50% erhöht, dafür erleidet es 1/8 seiner maximalen hp Schaden am Ende der Runde.',
        language: {
          name: 'de',
        },
        short_effect:
          'Erhöht den special attack um 50% aber zieht jede Runde 1/8 der max hp ab während starkem Sonnenlicht.',
      },
      {
        effect:
          'During strong sunlight, this Pokémon has 1.5x its Special Attack but takes 1/8 of its maximum HP in damage after each turn.',
        language: {
          name: 'en',
        },
        short_effect:
          'Increases Special Attack to 1.5x but costs 1/8 max HP after each turn during strong sunlight.',
      },
    ],
  },
];
