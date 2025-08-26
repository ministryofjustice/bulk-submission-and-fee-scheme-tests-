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
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | true         | 0                         | 389.85        |
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | false        | 0                         | 336.65        |
      | CAPA    | 2013-06-09 | 88.12                 | 10.13                 | true         | 0                         | 385.05        |
      | CLIN    | 2013-06-10 | 90.14                 | 12.06                 | false        | 0                         | 297.2         |
      | DEBT    | 2013-06-11 | 92.16                 | 13.99                 | true         | 0                         | 322.15        |
      | ELA     | 2024-09-01 | 94.18                 | 15.92                 | false        | 0                         | 267.1         |
      | HOUS    | 2013-06-14 | 96.2                  | 17.85                 | true         | 0                         | 302.45        |
      | MISCGEN | 2013-06-15 | 98.22                 | 19.78                 | false        | 0                         | 197           |
      | MISCCON | 2015-06-16 | 100.24                | 21.71                 | true         | 0                         | 312.75        |
      | MISCASBI| 2015-06-17 | 102.26                | 23.64                 | false        | 0                         | 282.9         |
      | MISCPI  | 2015-06-18 | 104.28                | 25.57                 | true         | 0                         | 373.45        |
      | MISCEMP | 2013-06-19 | 106.3                 | 27.5                  | false        | 0                         | 340.8         |
      | PUB     | 2013-06-20 | 108.32                | 29.43                 | true         | 0                         | 448.55        |
      | MAM1    | 2013-06-07 | 50.5                  | 20.15                 | true         | 0                         | 175.05        |
      | MAM3    | 2025-08-07 | 999                   | 200                   | false        | 0                         | 1329          |
      | MED1    | 2016-08-08 | 50.5                  | 20.15                 | true         | 1                         | 272.25        |
      | MED20   | 2017-08-09 | 650                   | 17.62                 | false        | 2                         | 1199.62       |
      | MED30   | 2018-08-10 | 230                   | 647                   | true         | 2                         | 1330.6        |
      | MED32   | 2019-08-11 | 100                   | 20                    | false        | 1                         | 413           |
      | MED30   | 2018-08-10 | 100                   | 20                    | true         | 2                         | 573.6         |
