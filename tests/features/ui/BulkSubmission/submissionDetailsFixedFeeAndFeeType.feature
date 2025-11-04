Feature: Submission details - Fixed fee & Fee type

  Background:
    Given I am on the bulk import page

  @temp
  Scenario: Should show both escaped and fixed claims - Legal Help
    Given I generate "Legal help" "csv" file with the following claims
      | feeCode | profitCost | londonNonLondonRate |
      | FPB020  | 2000       | Y                   |
      | FPB020  | 1000       | Y                   |
    When I upload the generated file and wait for import in progress
    And I should see the submission summary for "Legal help"
