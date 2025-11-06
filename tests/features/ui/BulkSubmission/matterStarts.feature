@bulkSubmission @matterStarts
Feature: Matter Starts Uploads

  Scenario Outline: Successful bulk submission for <AreaOfLaw> matter starts
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "csv" with all matter type file
    And I upload the generated file
    Then I should see the submission summary for "<AreaOfLaw>" with matter starts matching the generated file

  Examples:
    | AreaOfLaw |
    | Legal help  |
    | Mediation   |

  Scenario Outline: Successful submission shows no matter starts
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "csv" file with "<Outcomes>" outcomes
    And I upload the generated file
    Then I should see the submission summary for "<AreaOfLaw>" with no matter starts message
  
  @nilSubmissions
  Examples:
    | AreaOfLaw   | Outcomes | 
    | Legal help  | 0        | 
    | Mediation   | 0        | 

  Examples:
    | AreaOfLaw   | Outcomes | 
    | Legal help  | 2        | 
    | Mediation   | 2        |

  Scenario Outline: Crime lower submission hides matter starts tab
    Given I am on the bulk import page
    When I generate "Crime lower" "csv" file with "<Outcomes>" outcomes
    And I upload the generated file
    Then I should see the submission summary for "Crime lower" without a matter starts tab

    Examples:
      | Outcomes |
      | 0        |
      | 1        |
