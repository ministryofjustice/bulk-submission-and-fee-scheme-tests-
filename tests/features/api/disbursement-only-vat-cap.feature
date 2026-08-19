@api @disbursement_vat_cap @disbursement_only
Feature: Immigration and Asylum disbursement-only VAT cap (WARALL1)

  See LFSP-530.

  @warall1
  Scenario Outline: Disbursement VAT above the cap is capped and WARALL1 is returned
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | ICASD                   |
      | startDate             | 2013-04-01              |
      | netDisbursementAmount | 100                     |
      | disbursementVatAmount | <disbursementVatAmount> |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "validationMessages.0.type" should equal "WARNING"
    And the JSON path "validationMessages.0.code" should equal "WARALL1"
    And the JSON path "validationMessages.0.message" should equal "Value entered exceeds the VAT threshold for the net disbursement amount claimed. Costs have been capped at the maximum VAT amount claimable."
    And the JSON path "feeCalculation.requestedDisbursementVatAmount" should equal number <disbursementVatAmount>
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 20.00
    And the JSON path "feeCalculation.totalAmount" should equal number 120.00

    Examples: Entered disbursement VAT exceeds 20% of the 100 net disbursement
      | disbursementVatAmount |
      | 20.01                 |
      | 50                    |

  @disbursement_vat_within_cap
  Scenario Outline: Disbursement VAT at or below the cap is accepted unchanged
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | ICASD                   |
      | startDate             | 2013-04-01              |
      | netDisbursementAmount | 100                     |
      | disbursementVatAmount | <disbursementVatAmount> |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number <disbursementVatAmount>
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>

    Examples: Entered disbursement VAT is within 20% of the net disbursement (no capping)
      | disbursementVatAmount | expectedTotal |
      | 20                    | 120.00        |
      | 19.99                 | 119.99        |

  @warall1 @disbursement_limit
  Scenario: Disbursement VAT cap uses the capped net disbursement when the disbursement limit is exceeded
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode               | ICASD      |
      | startDate             | 2013-04-01 |
      | netDisbursementAmount | 5000       |
      | disbursementVatAmount | 1000       |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    # net disbursement is capped to the £1600 disbursement limit (WARIA11), and the VAT cap
    # then uses 20% of the CAPPED £1600 (i.e. £320), not 20% of £5000. Both warnings are
    # asserted as a set so the test does not depend on their order.
    And the validation message codes should be "WARIA11,WARALL1"
    And the JSON path "feeCalculation.disbursementAmount" should equal number 1600
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 320
    And the JSON path "feeCalculation.totalAmount" should equal number 1920.00

  @warall1 @prior_authority
  Scenario: Prior authority lifts the disbursement limit but the VAT cap still applies to the full net disbursement
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode                          | ICASD      |
      | startDate                        | 2013-04-01 |
      | netDisbursementAmount            | 5000       |
      | disbursementVatAmount            | 1500       |
      | immigrationPriorAuthorityNumber  | PA1234     |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    # prior authority number means the net disbursement is NOT capped, so WARALL1 is the only
    # warning (the exact-set assertion also proves WARIA11 is absent) ...
    And the validation message codes should be "WARALL1"
    And the JSON path "feeCalculation.disbursementAmount" should equal number 5000
    # ... but the VAT cap still applies: 20% of £5000 = £1000
    And the JSON path "feeCalculation.disbursementVatAmount" should equal number 1000
    And the JSON path "feeCalculation.totalAmount" should equal number 6000.00
