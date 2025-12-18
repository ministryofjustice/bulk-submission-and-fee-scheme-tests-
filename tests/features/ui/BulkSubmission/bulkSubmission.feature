@upload @stable
Feature: Bulk Submission via UI

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page


  @content
#  Scenario: Search results table layout matches design
  Scenario Outline: Successful bulk submission for <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    And I am on the Search page
    When I search using the most recent submission reference
    Then the search results table matches the expected layout
    And I open the most recent submission from the results list
    Then I should see the submission summary for "<AreaOfLaw>" with "<Claims>" claims

    @validSubmissions @search
    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
      | Legal help  | csv    | 2        | 2      |
      | Mediation   | csv    | 2        | 2      |
      | Crime lower | csv    | 3        | 3      |


  Scenario Outline: Successful nil bulk submission for <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    And I am on the Search page
    When I search using the most recent submission reference
    And I open the most recent submission from the results list
    Then I should see the submission summary for "<AreaOfLaw>" with "<Claims>" claims

    @nilSubmissions @search
    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
      | Mediation   | xml    | 0        | 0      |
      | Legal help  | csv    | 0        | 0      |
      | Crime lower | xml    | 0        | 0      |


  @submissionValidation
  Scenario Outline: Submission Period Validation : Submission already exists for Office" for <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    And click import

    When I re-upload the generated file
    Then I should have duplicate submission error for "Office" "<AreaOfLaw>"
      | submission period |
    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | Legal help  | txt    | 2        |
      | Mediation   | csv    | 2        |
      | Crime lower | csv    | 2        |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | Crime lower | txt    | 1        |
      | Legal help  | txt    | 0        |
      | Mediation   | txt    | 0        |


  @duplicateChecks @claimValidation
  Scenario Outline: Duplicate Claim within the same submission <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I duplicate the last record in the generated file
    And I upload the generated file
    And I am on the Search page
    When I search using the most recent submission reference
    And I open the most recent submission from the results list
    Then I should see an error banner saying "2 claims have errors for missing or incorrect information"
    And I should see the following submission error messages for "<AreaOfLaw>":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | Legal help  | csv    | 2        |
      | Mediation   | csv    | 2        |
      | Crime lower | csv    | 3        |