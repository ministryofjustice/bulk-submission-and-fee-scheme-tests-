@bulkSubmission
Feature: Bulk Submission via UI

  Scenario Outline: Successful bulk submission for <AreaOfLaw>
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    Then I should see the submission summary for "<AreaOfLaw>" with "<Claims>" claims

    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
      | Legal help  | xml    | 20        | 2      |
      | Mediation   | csv    | 20        | 2      |
      | Mediation   | xml    | 0        | 0      |
      | Legal help  | csv    | 0        | 0      |
      | Crime lower | xml    | 0        | 0      |


  Scenario Outline: Submission Period Validation : Submission already exists for Office" for <AreaOfLaw>
    Given I am on the bulk import page
    When I upload "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes via the API
    And I upload the generated file
    Then I should have 1 submission error for "<AreaOfLaw>"
      | submission period |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | LEGAL HELP  | txt    | 2        |
      | MEDIATION   | txt    | 1        |
      | CRIME LOWER | txt    | 0        |


#  Scenario Outline: Reject submission due to period prior to 2015
#    Given I am on the bulk import page
#    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
#    And I upload the generated file
#    Then I should see a submission error message for "<AreaOfLaw>" saying
#    """
#    Submissions for periods before JAN-2015 are not accepted. Please submit for a period on or after JAN-2015.
#    """
#
#    Examples:
#      | AreaOfLaw  | Format | Outcomes |
#      | Mediation  | txt    | 1        |