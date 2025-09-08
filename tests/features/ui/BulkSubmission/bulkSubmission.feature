@bulkSubmission
Feature: Bulk import
  To bulk import your claims,
  use the Controlled Work spreadsheet or your case management system to create an XML or CSV file.

  @bulkSubmission
  Scenario Outline: Bulk submission happy path with valid <files>
    Given I am on the bulk import page
    When I upload "<files>"
    Then I should be on the bulk Submission page
    And the import is complete and submission details are displayed

    Examples:
      | files                                  |
      | CRM_2M957X_19.txt                      |
      | CrimeBulkload2Q280XOCT2024_NIL_DEV.csv |
      | tests/data/crime_lower.xml             |
      | CivilBulkload0U733AMAR2020.csv         |


  @bulkSubmission @generateEmptyFile
  Scenario: Bulk submission fails with empty file
    Given I am on the bulk import page
    When I upload "emptyFile.csv"
    Then the user sees an error message "The uploaded file is empty"

  @bulkSubmission @generateInvalidFile
  Scenario: Bulk submission fails with invalid file type
    Given I am on the bulk import page
    When I upload "invalid"
    Then the user sees an error message "Only .xml, .csv and .txt files are allowed"


  @bulkSubmission @generateLargeFile
  Scenario: Bulk submission fails with large files
    Given I am on the bulk import page
    When I upload "invalid"
    Then the user sees an error message "File must be less than or equals to 10MB"