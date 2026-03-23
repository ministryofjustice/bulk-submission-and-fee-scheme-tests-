@accessibility @jamie @viewSubmission
Feature: View submission details page (VS)

  Background:
    Given I am on the bulk import page

  Scenario Outline: VS1-<abbr> accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I upload the generated file
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Crime lower | CL   |
      | Mediation   | M    |

  Scenario Outline: VS3-<abbr>-EMP accessibility checks
    When I generate "<areaOfLaw>" "csv" with all matter type file
    And I upload the generated file
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Mediation   | M    |

  Scenario Outline: VS2-<abbr> accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I upload the generated file
    Then I click the 'Messages' tab
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Crime lower | CL   |
      | Mediation   | M    |

  Scenario Outline: VS3-<abbr>-EMP accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I upload the generated file
    Then I click the 'Matter starts' tab
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Mediation   | M    |

  Scenario Outline: VS3-<abbr> accessibility checks
    When I generate "<areaOfLaw>" "csv" with all matter type file
    And I upload the generated file
    Then I click the 'Matter starts' tab
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Mediation   | M    |

  Scenario Outline: VS1-<abbr>-CW accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I override the generated file field "PROFIT_COST" with value "10000"
    And I upload the generated file
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Crime lower | CL   |

  Scenario Outline: VS2-<abbr>-CW accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I override the generated file field "PROFIT_COST" with value "10000"
    And I upload the generated file
    And I click the "Messages" tab
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |
      | Crime lower | CL   |

  Scenario Outline: VS3-<abbr>-EMP-CW accessibility checks
    When I generate "<areaOfLaw>" "csv" file with "11" outcomes
    And I override the generated file field "PROFIT_COST" with value "10000"
    And I upload the generated file
    And I click the "Matter starts" tab
    Then the page should have no accessibility violations
    Examples:
      | areaOfLaw   | abbr |
      | Legal help  | LH   |

  Scenario Outline: VS1-<abbr>-SE accessibility checks
    When I upload "tests/data/invalid/accessibility_checks/<file>"
    And I wait on validation in progress screen
    Then the page should have no accessibility violations
    Examples:
      | abbr | file                              |
      | LH   | legal_help_submission_error.csv  |
      | CL   | crime_lower_submission_error.csv |
      | M    | mediation_submission_error.csv   |

  Scenario Outline: VS1-<abbr>-CE accessibility checks
    When I upload "tests/data/invalid/accessibility_checks/<file>"
    And I wait on validation in progress screen
    Then the page should have no accessibility violations
    Examples:
      | abbr | file                              |
      | LH   | legal_help_claim_regex_errors.csv  |
      | CL   | crime_lower_claim_regex_errors.csv |
      | M    | mediation_claim_regex_errors.csv   |