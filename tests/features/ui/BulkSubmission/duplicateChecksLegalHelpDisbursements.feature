Feature: Duplicate checks - Legal Help - Disbursements

  Background:
    Given I am on the bulk import page

  Scenario Outline: Should reject submission if less than 3 months - reject
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
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
      | format | ufn        | ucn             | submissionPeriod | errorMessage                                                                               |
      | csv    | 010725/123 | 01011998/S/CSVA | JUN-2025         | Submission already exists for Office (0P322F), Area of Law (LEGAL HELP), Period (JUN-2025) |
      | csv    | 020825/323 | 02011998/S/CSVB | JUL-2025         | A duplicate claim was found in another submission                                          |

  # This is a bug
  Scenario Outline: Should reject submission if less than 3 months - accept
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn             | submissionPeriod |
      | csv    | 010725/123 | 01021998/S/CSVA | AUG-2025         |
      | csv    | 020725/123 | 01021998/S/CSVA | SEP-2025         |

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
      | csv    | 010825/123 | 01021998/S/CSVA | AUG-2025         |

  #This is a bug currently, UFN not used to differentiate duplicates
  Scenario Outline: Not duplicate if different ufn
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>1 |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>2 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn       | ucn             | submissionPeriod |
      | csv    | 010925/12 | 01021998/S/CSVA | JUN-2025         |

  #This is a bug currently, UCN not used to differentiate duplicates
  Scenario Outline: Not duplicate if different ucn
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
      | ucn    | feeCode | ufn   |
      | <ucn>A | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn    | feeCode | ufn   |
      | <ucn>B | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn            | submissionPeriod |
      | csv    | 011025/123 | 01021998/S/CSV | JUN-2025         |

  # TODO: Setup different office for user
  Scenario Outline: Not duplicate if different office
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
      | ucn    | feeCode | ufn   |
      | <ucn>A | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn    | feeCode | ufn   |
      | <ucn>B | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn            | submissionPeriod |
      | csv    | 011025/123 | 01021998/S/CSV | JUN-2025         |

  #This is a bug currently, fee code not used to differentiate duplicates
  Scenario Outline: Not duplicate if different fee code
    Given I generate "Legal help" "<format>" file with the following claims from period "JUN-2025"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICSSD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn             | submissionPeriod |
      | csv    | 011025/123 | 01021998/S/CSVA | JUN-2025         |



