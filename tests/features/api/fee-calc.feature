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
      | COM     | 2013-06-08 |                  50.5 |                 20.15 | true         |                         0 |        389.85 |
      | COM     | 2013-06-08 |                  50.5 |                 20.15 | false        |                         0 |        336.65 |
      | MAM1    | 2013-06-07 |                  50.5 |                 20.15 | true         |                         0 |        175.05 |
      | MAM3    | 2025-08-07 |                   999 |                   200 | false        |                         0 |          1329 |
      | MED1    | 2016-08-08 |                  50.5 |                 20.15 | true         |                         1 |        272.25 |
      | MED20   | 2017-08-09 |                   650 |                 17.62 | false        |                         2 |       1199.62 |
      | MED30   | 2018-08-10 |                   230 |                   647 | true         |                         2 |        1330.6 |
      | MED30   | 2018-08-10 |                   100 |                   20  | true         |                         2 |         573.6 |
      | MED32   | 2019-08-11 |                   100 |                    20 | false        |                         1 |           413 |
