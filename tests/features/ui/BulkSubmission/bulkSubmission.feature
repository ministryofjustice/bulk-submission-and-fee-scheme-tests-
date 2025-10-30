@bulkSubmission
Feature: Bulk Submission via UI

  Scenario Outline: Successful bulk submission for <AreaOfLaw>
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I upload the generated file
    Then I should see the submission summary for "<AreaOfLaw>" with "<Claims>" claims

    @validSubmissions
    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
      | Legal help  | csv    | 2        | 2      |
      | Mediation   | csv    | 2        | 2      |
      | Crime lower | csv    | 3        | 3      |

    @nilSubmissions
    Examples:
      | AreaOfLaw   | Format | Outcomes | Claims |
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
      | MEDIATION   | csv    | 1        |
      | CRIME LOWER | csv    | 1        |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | CRIME LOWER | txt    | 1        |
      | LEGAL HELP  | txt    | 0        |
      | MEDIATION   | txt    | 0        |

