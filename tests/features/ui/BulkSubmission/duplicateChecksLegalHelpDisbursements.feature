Feature: Duplicate checks - Legal Help - Disbursements

  Background:
    Given I am on the bulk import page

    @temp
  Scenario Outline: Should reject submission if less than 3 months
    Given I generate "Legal help" "<format>" file with the following claims from period "FEB-2026"
      | ucn                  | feeCode | ufn   |
      | 07081998/S/<format>E | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn                  | feeCode | ufn   |
      | 07081998/S/<format>E | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
    Examples:
      | format | ufn        | submissionPeriod |
      | csv    | 060725/123 | FEB-2026         |
      | csv    | 060725/123 | MAR-2026         |
      # TODO: XML Not working when uploading to API
      #| xml    | 060725/456 | FEB-2026 |
      | txt    | 060725/789 | MAR-2026         |

  #Disbursement rule no longer applies due to BC-76. Leaving commented for when testing work starts on BC-76.
  #Scenario Outline: Should have no errors in <format> submission (disbursement 3 month rule)
  #  Given I generate "Legal help" "<format>" file with the following claims from period "MAY-2025"
  #    | ucn                  | feeCode | ufn   |
  #    | 07081998/S/<format>E | CAPA    | <ufn> |
  #  And I upload with generated file via the API
  #  And I generate "Legal help" "<format>" file with the following claims from period "AUG-2025"
  #    | ucn                  | feeCode | ufn   |
  #    | 07081998/S/<format>E | ICISD   | <ufn> |
  #  When I upload the generated file and wait for import in progress
  #  Then I should see the submission summary for "Legal help"
  #  Examples:
  #    | format | ufn        |
  #    | csv    | 060725/123 |
  #    # TODO: XML Not working when uploading to API
  #    #| xml    | 060725/456 |
  #    | txt    | 060725/789 |


