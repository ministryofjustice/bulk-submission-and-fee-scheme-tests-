@accessibility @viewClaim
Feature: View claim details page (VC)

  Background:
    Given I am on the bulk import page

    @temp
  Scenario Outline: VC1-<abbr> accessibility checks
    Given I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I upload the generated file
    When I open the first claim in the submission
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Crime lower | CL   |
      | Mediation   | M    |
