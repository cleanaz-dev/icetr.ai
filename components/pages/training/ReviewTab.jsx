import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { BookOpen } from 'lucide-react'
import React from 'react'

export default function ReviewTab({ data }) {
  return (
    <>
     <TabsContent value="library" className="space-y-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Script Library</CardTitle>
                <CardDescription>
                  Proven templates and examples for better results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    "Opening Hook Scripts",
                    "Objection Responses",
                    "Closing Techniques",
                    "Follow-up Templates",
                    "Industry-Specific Pitches",
                    "Success Stories",
                  ].map((script, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <BookOpen className="w-8 h-8 text-primary mb-3" />
                        <h4 className="font-semibold mb-2">{script}</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Proven templates and examples for better results
                        </p>
                        <Button variant="ghost">View Scripts →</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
    </>
  )
}
