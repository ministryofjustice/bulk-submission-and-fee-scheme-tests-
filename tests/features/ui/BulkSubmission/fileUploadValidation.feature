@fileUpload @stable @PreSubmissionValidationChecks
Feature: Bulk Submission Upload Validation

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  @smoke
  Scenario: Upload fails with an empty file
    Given I have generated an "empty" bulk submission file named "emptyFile.csv"
    When I upload that file
    Then the user sees an error message "The selected file is empty"

  Scenario: Upload fails when no file is attached
    When I click upload without attaching a file
    Then the user sees an error message "Select a file"

  @smoke
  Scenario: Upload fails with an invalid file type
    Given I have generated an "invalid" bulk submission file named "invalid.docx"
    When I upload that file
    Then the user sees an error message "The selected file must be a valid CSV, XML or TXT file"

  @ignore
  Scenario: Upload fails with a file larger than 10MB
    Given I have generated an "large" bulk submission file named "largeFile.csv"
    When I upload that file
    Then the user sees an error message "The file must be 10MB or smaller"


  Scenario: Upload fails with restricted office access
    Given I have generated an "restricted" bulk submission file named "officeRestriction.csv"
    When I upload that file
    Then the user sees an error message "The selected file contains office account 0E525U. You do not have access to this office"

  Scenario: Upload fails with Invalid Area of Law
    When I upload "tests/data/invalid/invalidAreaOfLaw.csv"
    Then the user sees an error message "Area of law must be Mediation, Crime Lower or Legal Help"

  Scenario Outline: Upload fails with number format exception
    Given I generate "<AreaOfLaw>" "csv" file with "1" outcomes
    And I override the generated file field "<field>" with value "<value>"
    When I upload that file
    Then the user sees an error message "<fieldDisplayValue>"
    # NOTE: wider permutations of invalid numeric values are covered by laa-data-claims-api unit tests.
    # See: https://github.com/ministryofjustice/laa-data-claims-api/blob/main/claims-data/service/src/test/java/uk/gov/justice/laa/dstew/payments/claimsdata/mapper/BulkSubmissionMapperTests.java
    Examples:
      | AreaOfLaw  | field        | value      |  | fieldDisplayValue             |
      | Legal help | TRAVEL_TIME  | 9999999999 |  | Travel Time must be a number  |
      | Legal help | WAITING_TIME | 9999999999 |  | Waiting Time must be a number |
      | Legal help | TRAVEL_TIME  | NAN        |  | Travel Time must be a number  |
      | Legal help | WAITING_TIME | NAN        |  | Waiting Time must be a number |

  Scenario Outline: Upload fails with Invalid Submission Period
    Given I generate "Legal help" "csv" file with "1" outcomes
    And I override the generated file field "submissionPeriod" with value "<value>"
    When I upload that file
    Then the user sees an error message "<message>"
    Examples:
      | value     | message                                                                    |
      |           | Enter a submission period in the file                                      |
      | blah-blah | Enter the submission period in the format MMM-YYYY (for example, JAN-2025) |


    
