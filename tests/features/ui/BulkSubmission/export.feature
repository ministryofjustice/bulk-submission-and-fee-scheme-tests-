@stable @export
Feature: Export submission via UI

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: Successful export of submission for <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    And I am on the Search page
    When I search using the most recent submission reference
    Then the search results table matches the expected layout
    And I open the most recent submission from the results list
    Then I should see the submission summary for "<AreaOfLaw>" with "<Claims>" claims
    And I should be able to export the "<AreaOfLaw>" submission

    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
      | Legal help  | csv    | 2        | 2      |
      | Mediation   | csv    | 2        | 2      |
      | Crime lower | csv    | 3        | 3      |

  Scenario Outline: Should not be able to export when failed submission for <AreaOfLaw>
    Given I generate "<AreaOfLaw>" "csv" file with the following claims
      | caseStartDate |
      | 31/12/1980    |
    And I upload the generated file
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    Then I should not be able to export the submission

    Examples:
      | AreaOfLaw   |
      | Legal help  |
      | Mediation   |
      | Crime lower |