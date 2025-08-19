Feature: Fee Calculation API

  @api
  Scenario Outline: Calculate fee total for a given payload
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode                   | <feeCode>                   |
      | startDate                 | <startDate>                 |
      | netDisbursementAmount     | <netDisbursementAmount>     |
      | disbursementVatAmount     | <disbursementVatAmount>     |
      | vatIndicator              | <vatIndicator>              |
      | numberOfMediationSessions | <numberOfMediationSessions> |
    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>

    Examples:
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | expectedTotal |
      | COM     | 2013-06-07 | 50.50                 | 20.15                 | true         | 0                         | 389.85        |
      | COM     | 2013-06-07 | 50.50                 | 20.15                 | false        | 0                         | 336.65        |