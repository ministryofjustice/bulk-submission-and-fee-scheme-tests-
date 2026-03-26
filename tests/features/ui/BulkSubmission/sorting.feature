@stable
Feature: Sort submission via UI

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page


  @sorting
  Scenario Outline: Sort claim across multiple pages in a submission
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    Then sorting can be done on claim summary headers

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | Legal help  | csv    | 30       |
      | Mediation   | txt    | 40       |
      | Crime lower | xml    | 20       |
