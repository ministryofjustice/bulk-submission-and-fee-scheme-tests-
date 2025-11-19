@bulkSubmission
Feature: Bulk Submission via UI

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: Successful bulk submission for <AreaOfLaw>
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
    When I upload "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes via the API
    And I upload the generated file
    Then I should have duplicate submission error for "0P322F" "<AreaOfLaw>"
      | submission period |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | LEGAL HELP  | txt    | 2        |
      | MEDIATION   | csv    | 1        |
      | CRIME LOWER | csv    | 1        |

    Examples:
      | AreaOfLaw   | Format | Outcomes |
      | LEGAL HELP  | txt    | 0        |
      | CRIME LOWER | csv    | 0        |
      | MEDIATION   | txt    | 0        |

  @fo
  Scenario Outline: Duplicate Claim within the same submission <AreaOfLaw>
    When I generate "<AreaOfLaw>" "<Format>" file with "<Outcomes>" outcomes
    And I duplicate the last record in the generated file
    And I upload the generated file
#    Then I should see an error banner saying "2 claims have errors for missing or incorrect information"
    And I should see the following submission error messages for "<AreaOfLaw>":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |

    Examples:
      | AreaOfLaw  | Format | Outcomes |
      | Legal help | csv    | 1        |
#      | Mediation   | csv    | 1        |
#      | Crime lower | csv    | 1        |