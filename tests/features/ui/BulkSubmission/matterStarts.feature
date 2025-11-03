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

  @nilSubmissions @Temp 
  Scenario Outline: Successful nil submission shows no matter starts
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "csv" file with "0" outcomes
    And I upload the generated file
    Then I should see the submission summary for "<AreaOfLaw>" with no matter starts message
  
  Examples:
    | AreaOfLaw   |
    | Legal help  |
    | Mediation   |

