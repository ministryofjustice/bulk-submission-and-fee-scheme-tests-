@wip @disabled
Feature: Display message checks

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario: Legal Help: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/legal_help_missing_fields.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                 |
      | Net Disbursement Amount is required                           |
      | Disbursements Vat Amount is required                          |
      | Unique File Number is required for Legal Help claims          |
      | Case Start Date is required for Legal Help claims             |
      | Case Concluded Date is required for Legal Help claims         |
      | Outcome Code is required for Legal Help claims                |
      | Travel Waiting Costs Amount is required for Legal Help claims |
      | Client Forename is required for Legal Help claims             |
      | Client Surname is required for Legal Help claims              |
      | Client Date of Birth is required for Legal Help claims        |
      | Unique Client Number is required for Legal Help claims        |
      | Client Postcode is required for Legal Help claims             |
      | Gender Code is required for Legal Help claims                 |
      | Ethnicity Code is required for Legal Help claims              |
      | Disability Code is required for Legal Help claims             |
      | Advice Time is required for Legal Help claims                 |
      | Travel Time is required for Legal Help claims                 |
      | Waiting Time is required for Legal Help claims                |
      | Net Counsel Costs Amount is required for Legal Help claims    |
      | Case Id is required for Legal Help claims                     |
      | Case Reference Number is required for Legal Help claims       |
      | Schedule Reference is required for Legal Help claims          |
      | Net Profit Costs Amount is required for Legal Help claims     |

  Scenario: Crime Lower: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/crime_lower_missing_fields.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                              |
      | Net Disbursement Amount is required                        |
      | Disbursements Vat Amount is required                       |
      | Case Concluded Date is required for Crime Lower claims     |
      | Net Profit Costs Amount is required for Crime Lower claims |

  Scenario: Mediation: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/mediation_missing_fields.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                          |
      | Net Disbursement Amount is required                    |
      | Disbursements Vat Amount is required                   |
      | Outreach Location is required for Mediation claims     |
      | Referral Source is required for Mediation claims       |
      | Client Forename is required for Mediation claims       |
      | Client Surname is required for Mediation claims        |
      | Client Date of Birth is required for Mediation claims  |
      | Unique Client Number is required for Mediation claims  |
      | Client Postcode is required for Mediation claims       |
      | Unique Case Id is required for Mediation claims        |
      | Schedule Reference is required for Mediation claims    |
      | Case Reference Number is required for Mediation claims |
      | Case Start Date is required for Mediation claims       |
      | Case Id is required for Mediation claims               |
      | Is Legally Aided is required for Mediation claims      |
      | Disability Code is required for Mediation claims       |
      | Ethnicity Code is required for Mediation claims        |
      | Gender Code is required for Mediation claims           |


