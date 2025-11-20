Feature: Fee Calculation API

  @api
  Scenario Outline: Calculate fee total for a given payload
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode                           | <feeCode>                          |
      | startDate                         | <startDate>                        |
      | netDisbursementAmount             | <netDisbursementAmount>            |
      | disbursementVatAmount             | <disbursementVatAmount>            |
      | vatIndicator                      | <vatIndicator>                     |
      | numberOfMediationSessions         | <numberOfMediationSessions>        |
      | boltOnHomeOfficeInterview         | <boltOnHomeOfficeInterview>        |
      | boltOnAdjournedHearing            | <boltOnAdjournedHearing>           |
      | boltOnCmrhOral                    | <boltOnCmrhOral>                   |
      | boltOnCmrhTelephone               | <boltOnCmrhTelephone>              |
      | boltOnSubstantiveHearing          | <boltOnSubstantiveHearing>         |
      | netProfitCosts                    | <netProfitCosts>                   |
      | netCostOfCounsel                  | <netCostOfCounsel>                 |
      | travelAndWaitingCosts             | <travelAndWaitingCosts>            |
      | uniqueFileNumber                  | <uniqueFileNumber>                 |
      | policeStationId                   | <policeStationId>                  |
      | policeStationSchemeId             | <policeStationSchemeId>            |
      | representationOrderDate           | <representationOrderDate>          |
      | netTravelCosts                    | <netTravelCosts>                   |
      | netWaitingCosts                   | <netWaitingCosts>                  |
      | londonRate                        | <londonRate>                       |
      | immigrationPriorAuthorityNumber   | <immigrationPriorAuthorityNumber>  |
      | detentionTravelAndWaitingCosts    | <detentionTravelAndWaitingCosts>   |
      | jrFormFilling                     | <jrFormFilling>                    |
      | caseConcludedDate                 | <caseConcludedDate>                |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>
    And the JSON path "escapeCaseFlag" should be boolean <expectedEscapeFlag>

