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
      | boltOnAdjournedHearing    | <boltOnAdjournedHearing>    |
    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>

    Examples:
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | true         | 0                         | 0                      | 389.85        |
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | false        | 0                         | 0                      | 336.65        |
      | CAPA    | 2013-06-09 | 88.12                 | 10.13                 | true         | 0                         | 0                      | 385.05        |
      | CLIN    | 2013-06-10 | 90.14                 | 12.06                 | false        | 0                         | 0                      | 297.20        |
      | DEBT    | 2013-06-11 | 92.16                 | 13.99                 | true         | 0                         | 0                      | 322.15        |
      | ELA     | 2025-06-14 | 94.18                 | 15.92                 | false        | 0                         | 0                      | 267.10        |
      | HOUS    | 2013-06-14 | 96.20                 | 17.85                 | true         | 0                         | 0                      | 302.45        |
      | MISCGEN | 2013-06-15 | 98.22                 | 19.78                 | false        | 0                         | 0                      | 197.00        |
      | MISCCON | 2015-06-16 | 100.24                | 21.71                 | true         | 0                         | 0                      | 312.75        |
      | MISCASBI| 2015-06-17 | 102.26                | 23.64                 | false        | 0                         | 0                      | 282.90        |
      | MISCPI  | 2015-06-18 | 104.28                | 25.57                 | true         | 0                         | 0                      | 373.45        |
      | MISCEMP | 2013-06-19 | 106.30                | 27.50                 | false        | 0                         | 0                      | 340.80        |
      | PUB     | 2013-06-20 | 108.32                | 29.43                 | true         | 0                         | 0                      | 448.55        |
      | MAM1    | 2013-06-07 | 50.5                  | 20.15                 | true         | 0                         | 0                      | 175.05        |
      | MAM3    | 2025-08-07 | 999                   | 200                   | false        | 0                         | 0                      | 1329.00       |
      | MED1    | 2016-08-08 | 50.5                  | 20.15                 | true         | 1                         | 0                      | 272.25        |
      | MED20   | 2017-08-09 | 650                   | 17.62                 | false        | 2                         | 0                      | 1199.62       |
      | MED30   | 2018-08-10 | 230                   | 647                   | true         | 2                         | 0                      | 1330.60       |
      | MED32   | 2019-08-11 | 100                   | 20                    | false        | 1                         | 0                      | 413.00        |
      | MED30   | 2018-08-10 | 100                   | 20                    | true         | 2                         | 0                      | 573.60        |
    
    @mental_health
    Examples: Mental Health
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | MHL01   | 2013-06-19 | 106.6                 | 12.23                 | true         | 0                         | 0                      | 434.43        |
      | MHL02   | 2013-06-20 | 170.8                 | 99.6                  | true         | 0                         | 2                      | 706.00        |
      | MHL03   | 2013-06-21 | 202.15                | 18.99                 | false        | 0                         | 3                      | 1022.14       |
      | MHL10   | 2013-06-22 | 1111.89               | 20.11                 | false        | 0                         | 0                      | 1261.00       |
