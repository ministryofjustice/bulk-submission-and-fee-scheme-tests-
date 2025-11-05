@duplicateChecks
Feature: Duplicate checks - Legal Help - Disbursements

  Background:
    Given I am on the bulk import page

  Scenario Outline: Should reject submission if less than 3 months
    Given I generate "Legal help" "<format>" file with the following claims from period "<originalSubmissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message  |
      | <errorMessage> |
    Examples:
      | originalSubmissionPeriod | format | ufn        | ucn             | submissionPeriod | errorMessage                                                                               |
      # 2 Months Prior
      | MAY-2021                 | csv    | 020825/123 | 01011998/S/CSVA | MAR-2021         | A duplicate claim was found in another submission                                          |
      # 1 Month Prior
      | JUN-2021                 | csv    | 020825/223 | 02011998/S/CSVA | JUL-2021         | A duplicate claim was found in another submission                                          |
      # Same month
      | AUG-2021                 | csv    | 010725/323 | 03011998/S/CSVA | AUG-2021         | Submission already exists for Office (0P322F), Area of Law (LEGAL HELP), Period (AUG-2021) |
      # 1 Month ahead
      | SEP-2021                 | csv    | 020825/423 | 04011998/S/CSVA | OCT-2021         | A duplicate claim was found in another submission                                          |
      # 2 Months ahead
      | NOV-2021                 | csv    | 020825/523 | 05011998/S/CSVA | JAN-2022         | A duplicate claim was found in another submission                                          |

  Scenario Outline: Should accept submission if more than 3 months
    Given I generate "Legal help" "<format>" file with the following claims from period "<originalSubmissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | originalSubmissionPeriod | format | ufn        | ucn             | submissionPeriod |
      # New submission for period earlier than original submission by 3 months
      | MAY-2022                 | csv    | 020725/121 | 01021998/S/CSVA | FEB-2022         |
      # New submission for period earlier than original submission by 5 months
      | JUN-2022                 | csv    | 020725/122 | 02021998/S/CSVA | JAN-2022         |
      # New submission for period later than original submission by 3 months
      | JUL-2022                 | csv    | 020725/123 | 03021998/S/CSVA | OCT-2022         |
      # New submission for period earlier than original submission by 4 months
      | AUG-2022                 | csv    | 020725/124 | 04021998/S/CSVA | DEC-2022         |

  Scenario Outline: Within file duplicates
    Given I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
      | A duplicate claim was found within the same submission |
    Examples:
      | format | ufn        | ucn             | submissionPeriod |
      | csv    | 010825/123 | 01021998/S/CSVA | JAN-2025         |

  Scenario Outline: Not duplicate if different ufn
    Given I generate "Legal help" "<format>" file with the following claims from period "<originalSubmissionPeriod>"
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>1 |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>2 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | originalSubmissionPeriod | format | ufn       | ucn             | submissionPeriod |
      | MAR-2023                 | csv    | 011025/12 | 01021998/S/CSVA | APR-2023         |

  Scenario Outline: Not duplicate if different ucn
    Given I generate "Legal help" "<format>" file with the following claims from period "<originalSubmissionPeriod>"
      | ucn    | feeCode | ufn   |
      | <ucn>A | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn    | feeCode | ufn   |
      | <ucn>B | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | originalSubmissionPeriod | format | ufn        | ucn            | submissionPeriod |
      | MAY-2023                 | csv    | 011025/123 | 01021998/S/CSV | JUN-2023         |

  # TODO: Test user does not have multiple offices. Disabling scenario for now
  #Scenario Outline: Not duplicate if different office
  #  Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025" with office "0P322F"
  #    | ucn    | feeCode | ufn   |
  #    | <ucn> | ICISD   | <ufn> |
  #  And I upload with generated file via the API
  #  And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>" with office "CHANGE ME"
  #    | ucn    | feeCode | ufn   |
  #    | <ucn> | ICISD   | <ufn> |
  #  When I upload the generated file and wait for import in progress
  #  Then I should see the submission summary for "Legal help"
  #  Examples:
  #    | format | ufn        | ucn             | submissionPeriod |
  #    | csv    | 011025/123 | 01021998/S/CSVA | JUN-2025         |
  #    | csv    | 011025/123 | 01021998/S/CSVA | JUL-2025         |

  Scenario Outline: Not duplicate if different fee code
    Given I generate "Legal help" "<format>" file with the following claims from period "<originalSubmissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICSSD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | originalSubmissionPeriod | format | ufn        | ucn             | submissionPeriod |
      | JUL-2023                 | csv    | 011025/123 | 01021998/S/CSVA | AUG-2023         |



