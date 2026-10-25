# Calculateur d'intérêts — rembourser ou placer

Route : **`/interets`** (`app/pages/interets.vue`).

Compare deux usages d'une **même somme mensuelle** `M` : rembourser le crédit par
anticipation, ou placer. Répond à deux questions : quelle stratégie gagne à
l'horizon choisi, et **à partir de quel rendement net** le placement devient
meilleur.

## Entrées

| Entrée                     | Type  | Défaut   |
| -------------------------- | ----- | -------- |
| Capital restant dû         | €     | `200000` |
| Durée restante             | mois  | `240`    |
| Taux du prêt               | % an. | `3.5`    |
| Montant mensuel `M`        | €     | `200`    |
| Rendement net du placement | % an. | `2.5`    |
| Plafond du placement       | €     | `0`      |
| Horizon de comparaison     | mois  | `0`      |

- Le rendement est **net** : frais et fiscalité déjà déduits (pas de calcul PEA
  ni de prélèvements sociaux en V1).
- `Plafond` : `0` = pas de plafond. Au-delà, les versements ne produisent plus
  d'intérêts (cas d'un Livret A plein, par exemple `22950`).
- `Horizon` : `0` = fin du prêt. Le bouton « Fin du prêt » recale l'horizon.

## Modèle

- Mensualité contractuelle `M0 = M(capital, durée, i)` (formule de
  [`amortization.ts`](../shared/utils/amortization.ts)) : elle **ne change pas**,
  c'est le même prêt dans les deux scénarios.
- **Rembourser** : chaque mois, `M0 + M` est versé à la banque ; l'excédent
  éventuel (dernier mois) part sur le placement. Prêt soldé, `M0 + M` vont sur le
  placement.
- **Placer** : le prêt suit son cours (`M0`), `M` est placé chaque mois. Prêt
  soldé, `M0 + M` vont sur le placement.
- Les deux stratégies ont donc le **même flux de trésorerie sortant** à chaque
  mois : la comparaison porte uniquement sur le patrimoine.
- Placement : intérêts calculés sur `min(solde, plafond)` ; plafond `0` =
  illimité.
- `patrimoine = placement − capital restant dû` ;
  `écart = patrimoine(placer) − patrimoine(rembourser)`.

## Résultats

- **Verdict** : stratégie gagnante à l'horizon, avec l'écart en euros.
- **Taux d'indifférence** : rendement net annuel pour lequel les deux patrimoines
  sont égaux à l'horizon. Calculé par dichotomie sur `[0 ; 30]` (précision
  0,001 pt). `—` lorsque placer gagne même à 0 % ou que rembourser gagne même à
  30 %.
- **Bascule** : premier mois où l'écart devient **strictement** positif. Au mois
  1 l'écart vaut exactement 0 (la somme `M` est soit du cash, soit du capital
  remboursé) : c'est bien à partir du mois 2 que les taux font la différence.
  `—` si le montant mensuel est nul ou si l'écart reste négatif.
- **Graphique** (`InterestWorthChart.vue`) : écart de patrimoine mois par mois ;
  au-dessus de zéro, placer gagne.
- **Tableau** (`InterestTable.vue`) : prêt, placement, patrimoine et écart pour
  les deux stratégies, mois par mois.

Le taux d'indifférence est, à peu de choses près, le taux du prêt : c'est la
traduction directe de « rembourser rapporte exactement le taux du crédit ». Les
plafonds, l'horizon et le moment où le prêt s'éteint font dévier la date de
bascule.

## Limites (V1)

- Fiscalité, prélèvements sociaux et seuil des 5 ans du PEA non modélisés : saisir
  un rendement net.
- Indemnités de remboursement anticipé non modélisées (remboursement supposé
  gratuit).
- Taux constants sur tout l'horizon (pas de révision du Livret A).
- Pas d'export/import JSON ; persistance `localStorage` uniquement
  (`interest-simulator-input`).

## Fichiers

| Fichier                                     | Rôle                                      |
| ------------------------------------------- | ----------------------------------------- |
| `shared/types/interest.ts`                  | types (`InterestInput`, `InterestResult`) |
| `shared/utils/interest.ts`                  | moteur (`compareStrategies`, dichotomie)  |
| `app/composables/useInterestSimulator.ts`   | état + actions                            |
| `app/composables/useInterestPersistence.ts` | sauvegarde localStorage                   |
| `app/components/InterestForm.vue`           | paramètres                                |
| `app/components/InterestSummary.vue`        | verdict, taux d'indifférence, bascule     |
| `app/components/InterestWorthChart.vue`     | graphique de l'écart                      |
| `app/components/InterestTable.vue`          | détail mensuel                            |
