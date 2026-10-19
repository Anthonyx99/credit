# Simulateur de crédit

Route : **`/simulateur`** (`app/pages/simulateur.vue`).

Simule un prêt à taux fixe avec **injections de capital** mensuelles (remboursement
anticipé partiel récurrent) et affiche l'amortissement mois par mois.

## Entrées

| Entrée                   | Type                    | Défaut     |
| ------------------------ | ----------------------- | ---------- |
| Capital emprunté         | nombre (€)              | `200000`   |
| Durée                    | mois                    | `240`      |
| Taux annuel nominal      | %                       | `3.5`      |
| Injections               | `number[]` (mois)       | `[]`       |
| Règle de recalcul        | `duration` \| `payment` | `duration` |
| Réinvestir la différence | booléen                 | `false`    |

## Modèle de calcul

- Taux mensuel : `i = tauxAnnuel / 100 / 12`.
- Mensualité d'amortissement d'un capital `P` sur `n` mois :

  ```text
  M(P, n) = P * i * (1 + i)^n / ((1 + i)^n - 1)   (i > 0)
  M(P, n) = P / n                                  (i = 0)
  ```

- `M0 = M(capital, durée)` : mensualité initiale.
- Chaque mois `m` :
  - `installment` : **mensualité recalculée** `M(soldeRestant, moisRestants)`.
  - `injection` : montant saisi pour le mois, **en plus** de la mensualité.
  - `différence = max(0, M0 - installment)`.
  - `réinvesti = (mode payment OU réinvestir) ? différence : 0`.
  - `sortie = installment + injection + réinvesti` (plafonnée au solde + intérêts).
  - `intérêts = solde * i`.
  - `capital = sortie - intérêts`, dont `capital mensualité = min(installment, sortie) - intérêts`
    et `capital injections = capital - capital mensualité`.
  - `solde -= capital`.

Conséquences :

- Mode `duration` sans réinvestissement : le prêt se termine exactement à la durée
  initiale ; les injections font **baisser la mensualité** et les intérêts.
- Mode `payment` : la mensualité recalculée baisse, mais la **différence est
  réinvestie** ; la sortie de cash reste `M0 + injection` et la **durée raccourcit**.
  Équivalent au mode `duration` avec réinvestissement (la case est forcée active).

## Résultats

- **KPI** (`LoanSummary.vue`) : mensualité initiale, dernière mensualité, intérêts
  totaux, économie d'intérêts, durée réelle, durée gagnée, total injecté, total
  remboursé.
- **Graphiques** (`nuxt-charts`) : capital restant dû (avec / sans injections) et
  sortie de cash mensuelle. Le tooltip (slot `#tooltip`) précise le mois, l'année,
  la mensualité, l'injection, le montant réinvesti et la sortie de cash.
- **Tableau d'amortissement** (`LoanScheduleTable.vue`) : une ligne par mois, avec
  la colonne `Injection` **éditable**, la mensualité recalculée, le réinvesti et la
  décomposition `Capital mens.` / `Capital inj.`.

## Saisie des injections

- **Par année** (`InjectionYearPanel.vue`) : un montant mensuel par année, appliqué
  aux 12 mois de l'année (ex. `400` en année 1, `300` en année 2). Le libellé
  `mixte` signale une année dont les mois diffèrent.
- **Par mois / plage** (tableau) : valeur + bornes « du mois / au mois » +
  `Remplir la plage`, `Tout effacer`. La copie d'une cellule se fait nativement
  dans l'`input` (Ctrl+C / Ctrl+V).

## Persistance & fichiers

- **localStorage** : l'entrée courante est sauvegardée sous la clé
  `loan-simulator-input` (composable `useLoanPersistence`, appelé une fois dans la
  page).
- **Export / import JSON** (depuis le formulaire) : fichier
  `{ version, input }`. L'import passe par `parseLoanSimulation` qui valide et
  normalise (bornes, longueur des injections).

## Fichiers

| Fichier                                 | Rôle                                   |
| --------------------------------------- | -------------------------------------- |
| `shared/types/loan.ts`                  | types (`LoanInput`, `LoanResult`, ...) |
| `shared/utils/amortization.ts`          | moteur (`buildSchedule`)               |
| `shared/utils/loan.ts`                  | défauts, normalisation, parsing        |
| `app/composables/useLoanSimulator.ts`   | état + actions                         |
| `app/composables/useLoanPersistence.ts` | sauvegarde localStorage                |
| `app/components/LoanForm.vue`           | paramètres, modes, export/import       |
| `app/components/LoanSummary.vue`        | KPI                                    |
| `app/components/LoanBalanceChart.vue`   | graphique capital restant dû           |
| `app/components/LoanPaymentChart.vue`   | graphique sortie de cash               |
| `app/components/InjectionYearPanel.vue` | injections par année                   |
| `app/components/LoanScheduleTable.vue`  | tableau d'amortissement éditable       |
