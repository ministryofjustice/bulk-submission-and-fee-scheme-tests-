@api @fixed_fee_disbursement_vat_cap
Feature: Immigration and Asylum fixed fee disbursement VAT cap (WARALL1)

  See LFSP-424.

  @warall1
  Scenario Outline: Disbursement VAT is capped across the I&A fixed fee codes
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | <feeCode>           |
      | startDate             | <startDate>         |
      | caseConcludedDate     | <caseConcludedDate> |
      | vatIndicator          | true                |
      | netDisbursementAmount | 100.21              |
      | disbursementVatAmount | 50                  |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "validationMessages.0.code" should equal "WARALL1"
    And the JSON path "feeCalculation.requestedDisbursementVatAmount" should equal number 50
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 20.04
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>

    Examples: Entered disbursement VAT of 50 exceeds 20% of the 100.21 net disbursement (max 20.04)
      | feeCode | startDate  | caseConcludedDate | expectedTotal |
      | IACA    | 2022-09-30 | 2022-09-30        | 392.65        |
      | IACB    | 2022-09-30 | 2022-09-30        | 1163.05       |
      | IMCA    | 2022-09-30 | 2022-09-30        | 392.65        |
      | IMLB    | 2025-12-22 | 2025-12-22        | 500.65        |
      | IDAS1   | 2025-12-22 | 2025-12-22        | 419.05        |

  @warall1 @vat_rate_by_case_concluded_date
  Scenario: The disbursement VAT cap uses the VAT rate in force on the case concluded date
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | IDAS2      |
      | startDate             | 2013-04-01 |
      | caseConcludedDate     | 2009-06-01 |
      | vatIndicator          | true       |
      | netDisbursementAmount | 100        |
      | disbursementVatAmount | 20         |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    # VAT rate on 2009-06-01 was 15%, so the maximum disbursement VAT is 15.00 not 20.00
    And the JSON path "validationMessages.0.code" should equal "WARALL1"
    And the JSON path "feeCalculation.vatRateApplied" should equal number 15
    And the JSON path "feeCalculation.requestedDisbursementVatAmount" should equal number 20
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 15.00
    And the JSON path "feeCalculation.calculatedVatAmount" should equal number 54.00
    And the JSON path "feeCalculation.totalAmount" should equal number 529.00

  @warall1 @disbursement_limit
  Scenario: Disbursement VAT cap uses the capped net disbursement when the £600 immigration disbursement limit is exceeded
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | IMCF       |
      | startDate             | 2024-09-30 |
      | caseConcludedDate     | 2026-01-01 |
      | vatIndicator          | true       |
      | netDisbursementAmount | 650        |
      | disbursementVatAmount | 130        |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    # net disbursement is capped to the £600 immigration limit (WARIA1) ...
    And the JSON path "validationMessages.0.code" should equal "WARIA1"
    And the JSON path "feeCalculation.requestedNetDisbursementAmount" should equal number 650
    And the JSON path "feeCalculation.disbursementAmount" should equal number 600
    # ... so the maximum disbursement VAT is 20% of the CAPPED £600 (i.e. £120), not 20% of £650
    And the JSON path "validationMessages.1.code" should equal "WARALL1"
    And the JSON path "feeCalculation.requestedDisbursementVatAmount" should equal number 130
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 120.00
    And the JSON path "feeCalculation.totalAmount" should equal number 2030.40

  @vat_rate_not_found
  Scenario: No VAT rate exists for the case concluded date so the calculation is rejected
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | IDAS2      |
      | startDate             | 2013-04-01 |
      | caseConcludedDate     | 1990-01-01 |
      | vatIndicator          | true       |
      | netDisbursementAmount | 100        |
      | disbursementVatAmount | 20         |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 404
    And the JSON path "message" should equal "No VAT rate found for date: 1990-01-01"
