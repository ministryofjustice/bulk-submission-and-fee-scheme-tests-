@validationChecks @stable @broke
Feature: MIME validation checks

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: Accept submission when <format> and has Mime Type <mimeType>
    Given I generate "Legal help" "<format>" file with "1" outcomes
    When I upload the generated file with mime type "<mimeType>"
    And I wait on validation in progress screen
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | mimeType                 |
      | txt    | text/plain               |
      | csv    | text/plain               |
      | csv    | text/csv                 |
      | xml    | text/xml                 |
      | csv    | application/vnd.ms-excel |

  Scenario Outline: Reject submission when <format> and has Mime Type <mimeType>
    Given I generate "Legal help" "<format>" file with "1" outcomes
    When I upload the generated file with mime type "<mimeType>"
    Then the user sees an error message "File content does not match the file extension"
    Examples:
      | format | mimeType        |
      | txt    | application/xml |
      | txt    | text/xml                 |
      | txt    | text/csv                 |
      | txt    | application/csv          |
      | txt    | application/vnd.ms-excel |
      | txt    | application/json         |
      | txt    | application/pdf          |
      | csv    | application/xml          |
      | csv    | text/xml                 |
      | csv    | text/html                |
      | csv    | application/json         |
      | xml    | text/csv                 |
      | xml    | text/plain               |
      | xml    | application/vnd.ms-excel |
      | xml    | application/csv          |
      | xml    | application/json         |
    
